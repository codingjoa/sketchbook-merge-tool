module.exports = function garbage(db) {
  // AlbumSketchMap에 남은 쓰레기 데이터 삭제
  db.run('delete from AlbumSketchMap where AlbumSketchMap.sketchid not in (select Sketch.uuid from Sketch)');
  db.run('delete from Album where Album.uuid not in (select AlbumSketchMap.albumid from AlbumSketchMap)');
  db.run('delete from Sketch where Sketch.uuid not in (select AlbumSketchMap.sketchid from AlbumSketchMap)');
  //db.run('delete from Album where AlbumSketchMap.sketchid not in (select Sketch.uuid from Sketch)');
}
