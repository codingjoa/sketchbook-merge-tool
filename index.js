const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const sqliteFile = process.env?.SQLITE ?? process.argv[2] ?? './localgallery.sqlite3';
const sqliteFileAbsolute = path.join(process.cwd(), sqliteFile);
const tiffDir = process.env?.TIFF_DIR ?? process.argv[3] ?? './import';
const tiffDirAbsolute = path.join(process.cwd(), tiffDir);

const db = new sqlite3.Database(sqliteFileAbsolute ?? './res/localgallery.sqlite3');

const tiff = require('tiff');
const tag = require('./lib/tagParse');
const { Image } = require('image-js');

const date = new Date().toISOString().slice(0,19).replace(/T/g, " ");

//dirWorker(tiffDirAbsolute).then(dbWorker).catch(console.error);
//dbWorker([]);

async function createThumbnail(buffer, wideHeight) {
  const image = await Image.load(buffer);
  const thumbnail = (wideHeight ? image.resize({
    height: 192,
    preserveAspectRatio: true
  }) : image.resize({
    width: 192,
    preserveAspectRatio: true
  })).toBuffer({
    format: 'png'
  });
  return Buffer.from(thumbnail);
}

async function dirWorker(dirname) {
  const dir = fs.readdirSync(dirname);
  const mapped = dir.map(file => {
    const buffer = Buffer.from(fs.readFileSync(path.join(tiffDirAbsolute, file)));
    const { name: uuid } = path.parse(file);
    let ifd = null;
    try {
      // tiff 이미지 중에서 회전, 반전되어 저장된 이미지는 디코딩에 실패함
      ifd = tiff.decode(buffer)[0];
    } catch(err) {
      console.error(err);
      return { uuid, success: false };
    }
    const width = ifd.fields.get(256);
    const height = ifd.fields.get(257);
    const layercount = tag.parseLayerMetadata(
      ifd.fields.get(50784)
    ) - 0;
    const createtime = date;
    const modifytime = date;
    const status = 'normal';
    const thumbnail = createThumbnail(buffer, (width<height));
    return {
      uuid,
      width,
      height,
      layercount,
      createtime,
      modifytime,
      status,
      thumbnail,
      success: true
    };
  });
  const promises = [];
  let i=0;
  for(const { thumbnail, ...row } of mapped) {
    if(!row.success) {
      continue;
    }
    promises[i++] = (async () => {
      const r = await thumbnail;
      return {
        ...row,
        thumbnail: r
      }
    })();
  }
  return promises;
}

async function dbWorker(promises) {
  const sketches = await Promise.all(promises);
  const map = {
    affectedRows: 0,
    albumid: 0
  };
  db.serialize(() => {
    //require('./lib/db.garbage')(db);
    /*
    Sketch 에 insert보다 affectedRows가 먼저 반환되는 문제를 해결해야 함
    require('./lib/db.insert.sketch')(db, sketches, affectedRows => {
      if(affectedRows) {
        require('./lib/db.insert.album')(db, date, albumid => {
          require('./lib/db.insert.albumsketch')(db, albumid, sketches);
        });
      } else {
        console.log('Sketch: 삽입된 내용 없음(건너뜀)');
      }
    });
    */
    db.each(`select * from sqlite_master`, (err, row) => {
      console.log(`${row.tbl_name}: ${row.name}`, row.sql);
    });
    //db.each(`select * from Sketch`, (err, row) => console.log(row));
    //db.each(`select * from AlbumSketchMap`, (err, row) => console.log(row));
    //db.each(`select * from Album`, (err, row) => console.log(row));
    //db.all(`select * from Sketch`, (err, rows) => console.log(rows.length));
  /*
    db.each('select * from Sketch', (err, row) => {
      console.log(row);
      //const uuid = row.uuid;
      //fs.writeFile(`./thumbnails/${uuid}.png`, row.thumbnail, err => console.error);
    })
  */
    db.close();
  });
}
