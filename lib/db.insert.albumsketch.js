
module.exports = function insertAlbumSketchMap(db, albumid, sketches) {
  db.get('select max(AlbumSketchMap.orderindex) + 1 as orderindex from AlbumSketchMap', (err, row) => {
    let orderindex = row.orderindex;
    for(const sketch of sketches) {
      db.get('select * from AlbumSketchMap where AlbumSketchMap.sketchid=?', sketch.uuid, (err, row) => {
        if(row) {
          console.log(`AlbumSketchMap-${sketch.uuid}: 이미 존재하는 이미지(건너뜀)`);
        } else {
          db.run('insert into AlbumSketchMap values($sketchid, $albumid, $orderindex)', {
            $sketchid: sketch.uuid,
            $albumid: albumid,
            $orderindex: orderindex++
          });
        }
      });

    }
  })
  //db.run('insert into AlbumSketchMap values (?, ?, ?)');

}
