
document.addEventListener('DOMContentLoaded', function () {

      const menu = document.querySelector('#primary-menu');
      const menuItems = document.querySelectorAll('#primary-menu > li.menu-item');
      const menuLinks = document.querySelectorAll('#primary-menu > li.menu-item > a');

      if (!menu || !menuItems.length || !menuLinks.length) return;

      // 1. 临时加粗所有链接，测量每个链接加粗后的宽度
      let totalBoldWidth = 0;
      const boldWidths = [];

      menuLinks.forEach(link => {
        const originalWeight = link.style.fontWeight;
        link.style.fontWeight = '700';
        const width = link.offsetWidth;
        link.style.fontWeight = originalWeight;

        boldWidths.push(width);
        totalBoldWidth += width;
      });

      // 2. 设置父容器为 inline-flex，使其宽度自适应内容
      menu.style.display = 'inline-flex';
      menu.style.flexWrap = 'nowrap';          // 禁止换行
      menu.style.maxWidth = '100%';             // 防止溢出视口

      // 3. 为每个菜单项设置固定宽度，并保持内边距
      menuLinks.forEach((link, index) => {
        link.style.display = 'inline-block';
        link.style.width = boldWidths[index] + 'px';
        link.style.boxSizing = 'content-box';   // 宽度仅指内容区，padding在外
        link.style.textAlign = 'center';
        // 保留原有左右内边距，但注意宽度已包含内边距？offsetWidth已包含padding，所以直接使用offsetWidth作为width（content-box下width不包括padding）会导致padding被额外添加，总宽度变大。
        // 因此需要调整：要么使用border-box，要么重新计算宽度。
        // 简便做法：改用 border-box，width 包含 padding 和 border，这样我们直接用 offsetWidth 作为 width 即可。
        link.style.boxSizing = 'border-box';
        link.style.width = boldWidths[index] + 'px';
        // 由于使用了border-box，padding会包含在width内，无需额外处理。
      });

      // 4. 禁止菜单项换行
      menuItems.forEach(li => {
        li.style.whiteSpace = 'nowrap';
      });
    


});

