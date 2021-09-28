const uuidv4 = require('uuid').v4;
module.exports = function insertAlbum(db, date, callback) {
  const name = date.slice(0,10);
  const uuid = uuidv4();
  const createtime = date;
  const modifytime = date;
  const status = 'normal';
  db.get('select max(Album.orderindex) + 1 as orderindex from Album', (err, row) => {
    const orderindex = row.orderindex;
    db.run('insert into Album values($uuid, $name, $createtime, $modifytime, $orderindex, $status)', {
      $uuid: uuid,
      $name: name,
      $createtime: createtime,
      $modifytime: modifytime,
      $orderindex: orderindex,
      $status: status
    });
    callback(uuid);
  });
}
