module.exports = function insertSketch(db, sketches, callback) {
  db.serialize(() => {
    let i = 0;
    for(const sketch of sketches) {
      console.log(sketch.uuid, sketch);
      db.get('select * from Sketch where Sketch.uuid=?', sketch.uuid, (err, row) => {
        if(row) {
          console.log(`Sketch-${sketch.uuid}: 이미 존재하는 이미지(건너뜀)`);
        } else {
          db.run('insert into Sketch values($uuid, $name, $width, $height, $layercount, $thumbnail, $createtime, $modifytime, $status)', {
            $uuid: sketch.uuid,
            $name: `${++i}`,
            $width: sketch.width,
            $height: sketch.height,
            $layercount: sketch.layercount,
            $thumbnail: sketch.thumbnail,
            $createtime: sketch.createtime,
            $modifytime: sketch.modifytime,
            $status: sketch.status
          });
        }
      });
    }
    callback(i);
  });
}
