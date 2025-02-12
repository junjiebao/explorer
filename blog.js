class BlogManager {
    constructor() {
        this.articles = JSON.parse(localStorage.getItem('blogPosts')) || [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        await this.loadArticles();
        this.bindEvents();
        this.filterArticles(this.currentCategory);
        this.initMobileNav();
    }

    async loadArticles() {
        try {
            // 从服务器获取文章数据
            const response = await fetch('/api/articles');
            if (!response.ok) throw new Error('Failed to load articles');
            this.articles = await response.json();
            this.renderArticles(this.articles);
        } catch (error) {
            console.error('Error loading articles:', error);
            this.renderArticles([]); // 显示空状态
        }
    }

    bindEvents() {
        // 绑定分类按钮点击事件
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.filterArticles(this.currentCategory);
            });
        });
    }

    filterArticles(category) {
        let filteredArticles = this.articles;
        if (category !== 'all') {
            filteredArticles = this.articles.filter(article => article.category === category);
        }
        this.renderArticles(filteredArticles);
    }

    renderArticles(articles) {
        // 按日期排序，最新的在前面
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const container = document.querySelector('.blog-grid');
        if (!container) return;

        if (articles.length === 0) {
            container.innerHTML = '<div class="no-posts">暂无相关文章</div>';
            return;
        }

        container.innerHTML = articles.map(article => `
            <article class="blog-card" onclick="window.location.href='blog/article.html?id=${article.id}'">
                ${article.image ? `
                    <img src="${article.image}" 
                         alt="${article.title}"
                         onerror="this.src='images/default-blog.jpg'"
                    >
                ` : ''}
                <div class="blog-content">
                    <span class="category">${this.getCategoryName(article.category)}</span>
                    <h2>${article.title}</h2>
                    <p class="excerpt">${this.getExcerpt(article.content)}</p>
                    <div class="blog-meta">
                        <span class="date">${new Date(article.date).toLocaleDateString('zh-CN')}</span>
                        ${article.source ? `<span class="source">来源: ${article.source}</span>` : ''}
                    </div>
                </div>
            </article>
        `).join('');
    }

    initMobileNav() {
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileNavToggle && navLinks) {
            // 确保事件只绑定一次
            mobileNavToggle.removeEventListener('click', this.toggleNav);
            mobileNavToggle.addEventListener('click', this.toggleNav);
        }
    }

    toggleNav = (event) => {
        event.preventDefault();
        const navLinks = document.querySelector('.nav-links');
        const icon = event.currentTarget.querySelector('i');
        
        navLinks.classList.toggle('active');
        
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    addSampleArticles() {
        const sampleArticles = [
           
        `).join('');
    }

    getCategoryName(category) {
        const categories = {
            news: '行业新闻',
            reviews: '游艇评测',
            shows: '展会动态',
            lifestyle: '游艇生活'
        };
        return categories[category] || category;
    }

    getExcerpt(content) {
        // 移除HTML标签并截取前150个字符
        const plainText = content.replace(/<[^>]+>/g, '');
        return plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;
    }

    // 添加保存文章的方法
    saveArticle(article) {
        // 生成唯一ID
        article.id = Date.now().toString();
        // 添加时间戳
        article.date = new Date().toISOString();
        // 将新文章添加到数组开头
        this.articles.unshift(article);
        // 保存到localStorage
        localStorage.setItem('blogPosts', JSON.stringify(this.articles));
        // 重新渲染文章列表
        this.renderArticles(this.articles);
    }
}

// 初始化博客管理器
document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
}); 