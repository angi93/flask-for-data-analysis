function showMessage(title, message, type){
      if(type === "success") {
        iziToast.success({
            title: '<strong>' + title + '</strong>',
            message: '<br>' + message,
            position: 'topRight',
            transitionIn: 'bounceInLeft',
            transitionOut: 'fadeOutLeft',
            timeout: 5000,
            close: true,
            progressBar: true,
            progressBarEasing: 'ease'
        });
      }
      else if(type === "successRedirect") {
        iziToast.success({
            title: '<strong>' + title + '</strong>',
            message: '<br>' + message,
            position: 'topRight',
            transitionIn: 'bounceInLeft',
            transitionOut: 'fadeOutLeft',
            timeout: 5000,
            close: true,
            progressBar: true,
            progressBarEasing: 'ease',
            onClosed: function(instance, toast, closedBy){
                location.replace('/userpage');
            }
        });
      }
      else if(type === "info") {
        iziToast.info({
            title: '<strong>' + title + '</strong>',
            message: '<br>' + message,
            position: 'topRight',
            transitionIn: 'bounceInLeft',
            transitionOut: 'fadeOutLeft',
            timeout: 5000,
            close: true,
            progressBar: true,
            progressBarEasing: 'ease'
        });
      }
      else if(type === "warning") {
        iziToast.warning({
            title: '<strong>' + title + '</strong>',
            message: '<br>' + message,
            position: 'topRight',
            transitionIn: 'bounceInLeft',
            transitionOut: 'fadeOutLeft',
            timeout: 5000,
            close: true,
            progressBar: true,
            progressBarEasing: 'ease'
        });
      }
      else if(type === "error") {
        iziToast.error({
            title: '<strong>' + title + '</strong>',
            message: '<br>' + message,
            position: 'topRight',
            transitionIn: 'bounceInLeft',
            transitionOut: 'fadeOutLeft',
            timeout: 5000,
            close: true,
            progressBar: true,
            progressBarEasing: 'ease'
        });
      }
      else if(type === "errorRedirect") {
        iziToast.error({
            title: '<strong>' + title + '</strong>',
            message: '<br>' + message,
            position: 'topRight',
            transitionIn: 'bounceInLeft',
            transitionOut: 'fadeOutLeft',
            timeout: 5000,
            close: true,
            progressBar: true,
            progressBarEasing: 'ease',
            onClosed: function(instance, toast, closedBy){
                location.replace('/userpage');
            }
        });
      }
    }

