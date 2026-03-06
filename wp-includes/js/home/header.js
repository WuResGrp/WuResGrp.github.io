
document.addEventListener('DOMContentLoaded', function () {

    const menuLinks = document.querySelectorAll('#primary-menu > li.menu-item > a');
    
    menuLinks.forEach(link => {

      const originalWeight = link.style.fontWeight;
      link.style.fontWeight = '700';

      const boldWidth = link.offsetWidth;
      
      link.style.fontWeight = originalWeight;
      
      link.style.width = boldWidth + 'px';

      link.style.display = 'inline-block';  

      link.style.textAlign = 'center';

      link.style.boxSizing = 'content-box'; 

    });
    
    // 为防止菜单项换行，设置white-space: nowrap
    document.querySelectorAll('#primary-menu > li.menu-item').forEach(li => {
      li.style.whiteSpace = 'nowrap';
    });

});

