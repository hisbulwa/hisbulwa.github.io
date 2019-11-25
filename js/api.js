var base_url = "https://api.football-data.org/v2/";

// Blok kode yang akan di panggil jika fetch berhasil
function status(response) {
  if (response.status !== 200) {
    console.log("Error : " + response.status);
    // Method reject() akan membuat blok catch terpanggil
    return Promise.reject(new Error(response.statusText));
  } else {
    // Mengubah suatu objek menjadi Promise agar bisa "di-then-kan"
    return Promise.resolve(response);
  }
}

// Blok kode untuk memparsing json menjadi array JavaScript
function json(response) {
  return response.json();
}

// Blok kode untuk meng-handle kesalahan di blok catch
function error(error) {
  // Parameter error berasal dari Promise.reject()
  console.log("Error : " + error);
}

function getStandings() {
  //console.log(document.getElementById("articles").innerHTML);
  if ('caches' in window) {
    caches.match(base_url + "competitions/2002/standings").then(function(response) {
      //console.log('aaa');
      if (response) {
        response.json().then(function (data) {
          console.log(data);
          //var x = data;
          // do something with the response, e.g. isolate the id of a linked resource
          //console.log(x['competition']);
          //console.log(x['standings']);
          var standing_all = data['standings'];
          var stage = standing_all[0];
          var tabel = stage['table'];
          //console.log(tabel);

          var articlesHTML = "";
          articlesHTML += `<table class="highlight">
                            <thead>
                            <tr>
                            <th class="center">Position</th>
                            <th colspan="2">Nama Club</th>
                            <th class="center">PG</th>
                            <th class="center">W</th>
                            <th class="center">D</th>
                            <th class="center">L</th>
                            <th class="center">GF</th>
                            <th class="center">GA</th>
                            <th class="center">GD</th>
                            <th class="center">Points</th>
                            </tr>
                            </thead>
                            <tbody>`;
          tabel.forEach(function(res) {
            var linkGambar = res.team['crestUrl'];
            linkGambar = linkGambar.replace(/^http:\/\//i, 'https://');
            //console.log(linkGambar);
            articlesHTML += `
              <tr>
                <td class="center">${res.position}</td>
                <td><img src="${linkGambar}" style="width:20pt;height:20pt;padding-right:5px"/></td>
                <td><a href="./team.html?id=${res.team['id']}"> ${res.team['name']}</a></td>
                <td class="center">${res.playedGames}</td>
                <td class="center">${res.won}</td>
                <td class="center">${res.draw}</td>
                <td class="center">${res.lost}</td>
                <td class="center">${res.goalsFor}</td>
                <td class="center">${res.goalsAgainst}</td>
                <td class="center">${res.goalDifference}</td>
                <td class="center">${res.points}</td>
              </tr>`;
          });
          articlesHTML += "</tbody> </table>";
          //console.log(articlesHTML);
          //console.log('ini mau dimasukin');
          // // Sisipkan komponen card ke dalam elemen dengan id #content
          //console.log(document.getElementById("articles").innerHTML);
          document.getElementById("articles").innerHTML = articlesHTML;
          //console.log('harusnya udah masuk bosku');
        });
      }
    })
  }

  fetch(base_url + "competitions/2002/standings",
  {headers: new Headers({
     'X-Auth-Token': '6d9aea26bce94fd2a3ed5d312361da3b',
  })})
    .then(status)
    .then(json)
    .then(function(data) {
      //console.log(data);
      var x = data;
      // do something with the response, e.g. isolate the id of a linked resource
      //console.log(x['competition']);
      //console.log(x['standings']);
      var standing_all = x['standings'];
      var stage = standing_all[0];
      var tabel = stage['table'];
      //console.log(tabel);

      var articlesHTML = "";
      articlesHTML += `<table class="highlight">
                        <thead>
                        <tr>
                        <th class="center">Position</th>
                        <th colspan="2">Nama Club</th>
                        <th class="center">PG</th>
                        <th class="center">W</th>
                        <th class="center">D</th>
                        <th class="center">L</th>
                        <th class="center">GF</th>
                        <th class="center">GA</th>
                        <th class="center">GD</th>
                        <th class="center">Points</th>
                        </tr>
                        </thead>
                        <tbody>`;
      tabel.forEach(function(res) {
        var linkGambar = res.team['crestUrl'];
        linkGambar = linkGambar.replace(/^http:\/\//i, 'https://');
        //   console.log(linkGambar);
        articlesHTML += `
          <tr>
            <td class="center">${res.position}</td>
            <td><img src="${linkGambar}" style="width:20pt;height:20pt;padding-right:5px"/></td>
            <td><a href="./team.html?id=${res.team['id']}"> ${res.team['name']}</a></td>
            <td class="center">${res.playedGames}</td>
            <td class="center">${res.won}</td>
            <td class="center">${res.draw}</td>
            <td class="center">${res.lost}</td>
            <td class="center">${res.goalsFor}</td>
            <td class="center">${res.goalsAgainst}</td>
            <td class="center">${res.goalDifference}</td>
            <td class="center">${res.points}</td>
          </tr>`;
      });
      articlesHTML += "</tbody> </table>";
      // // Sisipkan komponen card ke dalam elemen dengan id #content
      document.getElementById("articles").innerHTML = articlesHTML;
      })
      .catch(error);
}

function getTeam() {
  //console.log(document.getElementById("articles").innerHTML);
  if ('caches' in window) {
    caches.match(base_url + "competitions/2002/standings").then(function(response) {
      //console.log('aaa');
      if (response) {
        response.json().then(function (data) {
          console.log(data);
          //var x = data;
          // do something with the response, e.g. isolate the id of a linked resource
          //console.log(x['competition']);
          //console.log(x['standings']);
          var standing_all = data['standings'];
          var stage = standing_all[0];
          var tabel = stage['table'];
          //console.log(tabel);

          var articlesHTML = "";
          articlesHTML += `<table class="  highlight">
                            <thead>
                            <tr>
                            <th class="center">No</th>
                            <th colspan="2">Nama Club</th>
                            <th class="center">Aksi</th>
                            </tr>
                            </thead>
                            <tbody>`;
          tabel.forEach(function(res) {
            var linkGambar = res.team['crestUrl'];
            linkGambar = linkGambar.replace(/^http:\/\//i, 'https://');
            //console.log(linkGambar);
            articlesHTML += `
              <tr>
                <td class="center">${res.position}</td>
                <td style="display:none;">${res.team['id']}</td>
                <td><img src="${linkGambar}" style="width:20pt;height:20pt;padding-right:5px"/></td>
                <td><a href="./team.html?id=${res.team['id']}"> ${res.team['name']}</a></td>
                <td class="center"><button class="btn-small green" onclick="tambahtimfavorite(${res.team['id']})">Tambahkan Favorite</button></td>
              </tr>`;
          });
          articlesHTML += "</tbody> </table>";
          //console.log(articlesHTML);
          //console.log('ini mau dimasukin');
          // // Sisipkan komponen card ke dalam elemen dengan id #content
          //console.log(document.getElementById("articles").innerHTML);
          document.getElementById("list-team").innerHTML = articlesHTML;
          //console.log('harusnya udah masuk bosku');
        });
      }
    })
  }

  fetch(base_url + "competitions/2002/standings",
  {headers: new Headers({
     'X-Auth-Token': '6d9aea26bce94fd2a3ed5d312361da3b',
  })})
    .then(status)
    .then(json)
    .then(function(data) {
      //console.log(data);
      var x = data;
      // do something with the response, e.g. isolate the id of a linked resource
      //console.log(x['competition']);
      //console.log(x['standings']);
      var standing_all = x['standings'];
      var stage = standing_all[0];
      var tabel = stage['table'];
      //console.log(tabel);

      var articlesHTML = "";
      articlesHTML += `<table class="  highlight">
                        <thead>
                        <tr>
                        <th class="center">No</th>
                        <th colspan="2">Nama Club</th>
                        <th class="center">Aksi</th>
                        </tr>
                        </thead>
                        <tbody>`;
      tabel.forEach(function(res) {
        var linkGambar = res.team['crestUrl'];
        linkGambar = linkGambar.replace(/^http:\/\//i, 'https://');
        //   console.log(linkGambar);
        articlesHTML += `
          <tr>
            <td class="center">${res.position}</td>
            <td style="display:none;">${res.team['id']}</td>
            <td><img src="${linkGambar}" style="width:20pt;height:20pt;padding-right:5px"/></td>
            <td><a href="./team.html?id=${res.team['id']}"> ${res.team['name']}</a></td>
            <td class="center"><button class="btn-small green" onclick="tambahtimfavorite(${res.team['id']})">Tambahkan Favorite</button></td>
          </tr>`;
      });
      articlesHTML += "</tbody> </table>";
      // // Sisipkan komponen card ke dalam elemen dengan id #content
      document.getElementById("list-team").innerHTML = articlesHTML;
      })
      .catch(error);
}

function tambahtimfavorite(key){
  fetch(base_url + "teams/" +key,{
    headers: new Headers({
       'X-Auth-Token': '6d9aea26bce94fd2a3ed5d312361da3b',
     })
  })
    .then(status)
    .then(json)
    .then(function(response) {
      console.log(response);

      var dbPromise = idb.open("dbtimfavorit");
      dbPromise.then(function(db) {
        var tx = db.transaction('tim', 'readwrite');
        var store = tx.objectStore('tim');

        const id = response['id'];
        const nama_tim = response['name'];
        const url = response['crestUrl'];

        var item = {
            id: id,
            nama: nama_tim,
            icon: url,
        };
        store.add(item); //menambahkan key "buku"
        return tx.complete;
      }).then(function() {
        console.log('Buku berhasil disimpan.');
        alert('Tim favorit disimpan');
        bacatimfavorite();
      }).catch(function() {
        console.log('Buku gagal disimpan.')
        alert('Gagal disimpan');
      });

      // // Objek JavaScript dari response.json() masuk lewat variabel data.
      // result = response;
  });

}


function getTeamById() {
  // Ambil nilai query parameter (?id=)
  var urlParams = new URLSearchParams(window.location.search);
  var idParam = urlParams.get("id");

  if ('caches' in window) {
    caches.match(base_url + "teams/" +idParam).then(function(response) {
      if (response) {
        response.json().then(function (response) {
          console.log(response);
          // do something with the response, e.g. isolate the id of a linked resource
          //console.log(x);

          var articlesHTML = "<br>";
          articlesHTML += `<center><img src="${response.crestUrl}" style="width:200px;height:200px;" /></center>`;
          articlesHTML += `<center><h4>${response.name}</h4></center>`;
          articlesHTML += `<center><i><h6>${response.shortName}</h6></i></center> <br>`;
          articlesHTML += `<h4><b>Informasi Tim</b></h4>`;
          articlesHTML += `<table>
                            <tbody>
                              <tr>
                                <td><b>Nama Lengkap</b></td>
                                <td>${response.name}</td>
                              </tr>
                              <tr>
                                <td><b>Negara</b></td>
                                <td>${response.area['name']}</td>
                              </tr>
                              <tr>
                                <td><b>Tahun Berdiri</b></td>
                                <td>${response.founded}</td>
                              </tr>
                              <tr>
                                <td><b>Alamat</b></td>
                                <td>${response.address}</td>
                              </tr>
                              <tr>
                                <td><b>Email</b></td>
                                <td>${response.email}</td>
                              </tr>
                              <tr>
                                <td><b>Phone</b></td>
                                <td>${response.phone}</td>
                              </tr>
                            </tbody>
                          </table>`;
          articlesHTML += `<br>`;
          articlesHTML += `<h4><b>Team Squad</b></h4>`;
          articlesHTML += `<table class="highlight">
                            <thead>
                              <tr>
                                <th>No</th>
                                <th>Nama</th>
                                <th>Posisi</th>
                                <th>Kewarganegaraan</th>
                              </tr>
                            </thead><tbody>`;
          var squad = response['squad'];
          var int = 1;
          squad.forEach(function(res){
            //console.log(res);
            articlesHTML += `<tr>
                              <td>${int}</td>
                              <td>${res.name}</td>
                              <td>${res.position}</td>
                              <td>${res.nationality}</td>
                            </tr>`;
            int++;
          });
          articlesHTML += `</tbody></table>`;
          console.log('mau masuk detail tim nya');
          document.getElementById("body-content").innerHTML = articlesHTML;
        });
      }
    });
  }
  fetch(base_url + "teams/" +idParam,{
    headers: new Headers({
       'X-Auth-Token': '6d9aea26bce94fd2a3ed5d312361da3b',
     })
  })
    .then(status)
    .then(json)
    .then(function(response) {
      // Objek JavaScript dari response.json() masuk lewat variabel data.
      console.log(response);
      // Menyusun komponen card artikel secara dinamis
      // do something with the response, e.g. isolate the id of a linked resource
      //console.log(x);

      var articlesHTML = "<br>";
      articlesHTML += `<center><img src="${response.crestUrl}" style="width:200px;height:200px;" /></center>`;
      articlesHTML += `<center><h4>${response.name}</h4></center>`;
      articlesHTML += `<center><i><h6>${response.shortName}</h6></i></center> <br>`;
      articlesHTML += `<h4><b>Informasi Tim</b></h4>`;
      articlesHTML += `<table>
                        <tbody>
                          <tr>
                            <td><b>Nama Lengkap</b></td>
                            <td>${response.name}</td>
                          </tr>
                          <tr>
                            <td><b>Negara</b></td>
                            <td>${response.area['name']}</td>
                          </tr>
                          <tr>
                            <td><b>Tahun Berdiri</b></td>
                            <td>${response.founded}</td>
                          </tr>
                          <tr>
                            <td><b>Alamat</b></td>
                            <td>${response.address}</td>
                          </tr>
                          <tr>
                            <td><b>Email</b></td>
                            <td>${response.email}</td>
                          </tr>
                          <tr>
                            <td><b>Phone</b></td>
                            <td>${response.phone}</td>
                          </tr>
                        </tbody>
                      </table>`;
      articlesHTML += `<br>`;
      articlesHTML += `<h4><b>Team Squad</b></h4>`;
      articlesHTML += `<table class="highlight">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Posisi</th>
                            <th>Kewarganegaraan</th>
                          </tr>
                        </thead><tbody>`;
      var squad = response['squad'];
      var int = 1;
      squad.forEach(function(res){
        //console.log(res);
        articlesHTML += `<tr>
                          <td>${int}</td>
                          <td>${res.name}</td>
                          <td>${res.position}</td>
                          <td>${res.nationality}</td>
                        </tr>`;
        int++;
      });
      articlesHTML += `</tbody></table>`;
      document.getElementById("body-content").innerHTML = articlesHTML;
      // Sisipkan komponen card ke dalam elemen dengan id #content
      //document.getElementById("body-content").innerHTML = articleHTML;
    });
}

function getSchedule(){
  var dbPromise = idb.open("dbtimfavorit");
  var isiHTML ="";
  dbPromise.then(function(db) {
    var tx = db.transaction('tim', 'readonly');
    var store = tx.objectStore('tim');
    return store.getAll();
  }).then(function(items) {
    //console.log('Data yang diambil: ');
    //console.log(items);
    items.forEach(function(res) {
      fetch(base_url + "teams/" +res.id + "/matches?status=SCHEDULED",{
        headers: new Headers({
           'X-Auth-Token': '6d9aea26bce94fd2a3ed5d312361da3b',
         })
      })
        .then(status)
        .then(json)
        .then(function(jadwal){
          //isiHTML =+ `<p> jadwalnya tim ini</p>`;
          var i;
          for (i = 0; i < jadwal.matches.length; i++){
            var date = new Date(jadwal.matches[i].utcDate);
            var namahari = ['Minggu','Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            var namabulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            var hari = namahari[date.getUTCDay()];
            var tanggal = date.getUTCDate();
            var bulan = namabulan[date.getUTCMonth()];
            var tahun = date.getUTCFullYear();
            var jam = date.getUTCHours();
            var menit = date.getUTCMinutes();
            if (menit=="0"){
              menit = "00";
            };
            // console.log(hari);
            // console.log(hari);
            isiHTML += `<tr>
                          <td class="center">
                            ${jadwal.matches[i].homeTeam['name']} <br> vs. <br> ${jadwal.matches[i].awayTeam['name']}
                          </td>
                          <td class="center">
                            `+hari+`, `+tanggal+` `+bulan+` `+tahun+` <br>
                            `+jam+`:`+menit+` WIB
                          </td>
                        </tr>`;
            //console.log(jadwal.matches[i].homeTeam['name']);
            // isiHTML += `${jadwal.matches[i].homeTeam['name']}`;
            // isiHTML += `<br> ${jadwal.matches[i].awayTeam['name']} <br> <br>`;
            //console.log(jadwal.matches[i].awayTeam);
          }
          //console.log(text);
          // console.log(isiHTML);
          document.getElementById("list-jadwal").innerHTML = isiHTML;
          //nampilin jadwal setiap club belum yaa
        });
      });
  });
  // console.log(isiHTML);
  // document.getElementById("list-jadwal").innerHTML = isiHTML;
}
