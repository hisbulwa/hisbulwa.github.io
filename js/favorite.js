var dbPromise = idb.open("dbtimfavorit", 1, function(upgradeDb) {
  var tim = upgradeDb.createObjectStore("tim", {keyPath: 'id'});
  tim.createIndex("id", "id", { unique: true });
  tim.createIndex("nama", "nama", { unique: false });
  tim.createIndex("icon", "icon", { unique: false });
});


// function tambahtimfavorite(key){
//   var x = getTeamById2(key);
//
//   console.log(x);
//   // var dbPromise = idb.open("dbtimfavorit");
//   // dbPromise.then(function(db) {
//   //   var tx = db.transaction('tim', 'readwrite');
//   //   var store = tx.objectStore('tim');
//   //
//   //   const nama_tim = document.getElementById('tim').value;
//   //   const nama_negara = document.getElementById('negara').value;
//   //   var item = {
//   //       nama: nama_tim,
//   //       negara: nama_negara,
//   //   };
//   //   store.add(item); //menambahkan key "buku"
//   //   return tx.complete;
//   // }).then(function() {
//   //   console.log('Buku berhasil disimpan.');
//   // }).catch(function() {
//   //   console.log('Buku gagal disimpan.')
//   // });
//   //bacatimfavorite();
// }


function bacatimfavorite(){
  var dbPromise = idb.open("dbtimfavorit");
  var isiHTML = "";
  dbPromise.then(function(db) {
    var tx = db.transaction('tim', 'readonly');
    var store = tx.objectStore('tim');
    return store.getAll();
  }).then(function(items) {
    console.log('Data yang diambil: ');
    console.log(items);
    items.forEach(function(res) {
      // var linkGambar = res.team['icon'];
      // linkGambar = linkGambar.replace(/^http:\/\//i, 'https://');
      //console.log(res);
      isiHTML += `<tr>
                    <td><img src="${res.icon}" style="width:20pt;height:20pt;padding-right:5px"/></td>
                    <td>${res.nama}</td>
                    <td class="center">
                    <a onclick="hapusTim(${res.id})" class="waves-effect waves-light btn-flat red-text"><i class="material-icons left">delete</i></a>
                    </td>
                  </tr>`;
    });
    //console.log(document.getElementById("list-favorite"));
    document.getElementById("list-favorite").innerHTML = isiHTML;
  });
}

function getTeamFavoriteById(key){
    var dbPromise = idb.open("dbtimfavorit");
    dbPromise.then(function(db) {
    var tx = db.transaction('tim', 'readonly');
    var store = tx.objectStore('tim');
    // mengambil primary key berdasarkan isbn
    return store.get(key);
  }).then(function(val) {
    //  (val);
    console.log(val['nama']);
    document.getElementById('tim').value=val['nama'];
    document.getElementById('negara').value=val['negara'];
    document.getElementById('id').value=val['id'];
  });
}

function updateTim(){
  var dbPromise = idb.open("dbtimfavorit");
  const key = document.getElementById('id').value;
  const nama_tim = document.getElementById('tim').value;
  const nama_negara = document.getElementById('negara').value;
  dbPromise.then(function(db) {
      var tx = db.transaction('tim', 'readwrite');
      var store = tx.objectStore('tim');
      var item = {
          nama: nama_tim,
          negara: nama_negara,
      };
      // var key = {
      //     id:key,
      // }
      //console.log(item);
      store.put({id:key},item); //menambahkan KEY
      return tx.complete;
  }).then(function() {
      console.log('Buku berhasil disimpan.');
  }).catch(function() {
      console.error('Buku gagal disimpan.')
  })
}

function hapusTim(key){
  var dbPromise = idb.open("dbtimfavorit");
  // /const key = document.getElementById('id').value;
  dbPromise.then(function(db) {
    var tx = db.transaction('tim', 'readwrite');
    var store = tx.objectStore('tim');
    store.delete(key);
    return tx.complete;
  }).then(function() {
    console.log('Item deleted');
    bacatimfavorite();
    getSchedule();
  });

  // function getMatches(key){
  //
  // }
}
