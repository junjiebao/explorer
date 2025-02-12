document.addEventListener('DOMContentLoaded', function() {
    // 获取导航栏元素
    const nav = document.querySelector('nav');
    const mobileNavToggle = nav.querySelector('.mobile-nav-toggle');
    const navLinks = nav.querySelector('.nav-links');
    
    // 为所有导航链接添加点击事件
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // 特殊处理联系我们链接
            if (link.getAttribute('href') === '#contact') {
                e.preventDefault();
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
            
            // 关闭菜单
            navLinks.setAttribute('data-visible', 'false');
            mobileNavToggle.classList.remove('active');
            navLinks.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            
            // 恢复菜单图标
            const barsIcon = mobileNavToggle.querySelector('.fa-bars');
            const timesIcon = mobileNavToggle.querySelector('.fa-times');
            if (barsIcon && timesIcon) {
                barsIcon.style.display = 'inline';
                timesIcon.style.display = 'none';
            }
        });
    });

    // 处理移动端菜单点击事件
    if (mobileNavToggle && navLinks) {
        mobileNavToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 切换导航菜单的显示状态
            const visibility = navLinks.getAttribute('data-visible');
            
            if (visibility === 'false') {
                navLinks.setAttribute('data-visible', 'true');
                mobileNavToggle.classList.add('active');
                navLinks.classList.add('active');
                mobileNavToggle.setAttribute('aria-expanded', 'true');
            } else {
                navLinks.setAttribute('data-visible', 'false');
                mobileNavToggle.classList.remove('active');
                navLinks.classList.remove('active');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 点击页面其他区域关闭菜单
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-nav-toggle')) {
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.setAttribute('data-visible', 'false');
                mobileNavToggle.classList.remove('active');
                navLinks.classList.remove('active');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // 监听滚动事件，处理固定导航栏
    let scrollTimer;
    window.addEventListener('scroll', function() {
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }

        scrollTimer = setTimeout(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                nav.classList.add('nav-fixed');
                // 保持移动端菜单的可见性状态
                const isMenuVisible = navLinks.getAttribute('data-visible') === 'true';
                if (isMenuVisible) {
                    nav.querySelector('.nav-links').setAttribute('data-visible', 'true');
                }
            } else {
                nav.classList.remove('nav-fixed');
            }
        }, 100);
    });
}); 