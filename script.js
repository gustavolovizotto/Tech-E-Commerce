
      document.querySelectorAll('.catalog-fav').forEach(btn => {
        btn.addEventListener('click', function(e) {
          const img = btn.querySelector('img');
          const isFilled = img.getAttribute('data-filled') === 'true';
          if (isFilled) {
            img.src = 'images/coracao-header.svg';
            img.setAttribute('data-filled', 'false');
          } else {
            img.src = 'images/coracao1.svg';
            img.setAttribute('data-filled', 'true');
          }
        });
      });