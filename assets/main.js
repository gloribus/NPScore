function sortProperties (obj) {
  let sortable = [];
  for (var key in obj)
    if (obj.hasOwnProperty(key))
      sortable.push([key, obj[key]]);

  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });
  return sortable;
}

$(function () {
  const updateTime = 60000 * 1.5; // 1.5 минуты

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  function loadData () {
    $.ajax({
      type: 'GET',
      url: '/data',
      success: function (answer) {
        console.log(answer)
        if (answer.status === "success") {
          $('#cards').html("");
          let total = 0;
          let districtNeed = 2500;
          let percent = 0;
          let data = sortProperties(answer.data);

          let htmlMedal = '<img src="https://image.flaticon.com/icons/svg/610/610333.svg" class="medal">';

          $.each(data, function (key, value) {
            let name = value[0].replace(/округ/i, '');
            let signatures = value[1];

            percent = Math.floor(100 - (signatures / districtNeed * 100));
            if (percent < 0) percent = 0;
            $('#cards').append(`
            <div class="box">
            ${htmlMedal}
            <div class="text">
              <div class="name">${name}</div>
              <div class="signatures">${signatures}</div>
            </div>
            <div id="water" class="water" style="transform: translate(0px, ${percent}%)">
              <svg viewBox="0 0 560 20" class="water_wave water_wave_back">
                <use xlink:href="#wave"></use>
              </svg>
            </div>
          </div>
            `);

            htmlMedal = '';
            total += signatures;
          });

          percent = Math.floor(100 - (total / (districtNeed * Object.keys(data).length) * 100));
          if (percent < 0) percent = 0;

          $('#cards').prepend(`
          <div class="box amount">
            <div class="totalSignatures">
            <!--<span>Всего по округам</span><br>-->
            <b>Всего по округам<br>${total}</div>
          </div>
          `)
        } else if (answer.status === "error") {
          if (answer.code == 1) {
            setTimeout(loadData, 2000);
          } else {
            Toast.fire({
              icon: 'error',
              title: answer.error
            })
          }
        }
      },
      error: function (error) {
        Toast.fire({
          icon: 'error',
          title: 'Ошибка отправки данных'
        });
      }
    });
  }

  loadData();
  setInterval(loadData, updateTime);

});


