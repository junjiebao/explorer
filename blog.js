class BlogManager {
    constructor() {
        this.articles = JSON.parse(localStorage.getItem('blogPosts')) || [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        // 如果localStorage中没有文章，则添加示例文章
        if (this.articles.length === 0) {
            this.addSampleArticles();
        }
        await this.loadArticles();
        this.bindEvents();
        this.filterArticles(this.currentCategory);
        this.initMobileNav();
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
            {
                id: '1',
                title: '2024年迪拜国际游艇展3月1日至5日在迪拜港举行',
                category: 'shows',
                content: `
                    <p>2024年迪拜国际游艇展（Dubai International Boat Show）将于3月1日至5日在迪拜港举行，这是中东地区最具影响力的游艇展会。本届展会预计将吸引来自全球超过800家参展商，展出超过200艘游艇。</p>
                    <p>展会亮点包括：</p>
                    <ul>
                        <li>全球首发5艘超级游艇</li>
                        <li>可持续发展主题展区</li>
                        <li>水上运动体验区</li>
                        <li>游艇设计师论坛</li>
                    </ul>
                    <p>作为中东地区最具影响力的游艇展会，本届展会将重点展示最新的游艇技术创新和环保解决方案。</p>
                `,
                image: 'images/blog/yacht-show.jpg',
                date: '2024-02-15T10:00:00',
                source: '迪拜游艇展官方',
                tags: ['游艇展会', '迪拜', '超级游艇', '2024']
            },
            {
                id: '2',
                title: 'Benetti推出全新107米超级游艇Lana',
                category: 'reviews',
                content: `
                    <p>意大利豪华游艇制造商Benetti日前发布了其最新旗舰作品——107米超级游艇Lana。这艘游艇代表了Benetti在超级游艇建造领域的最高工艺水平。</p>
                    <h3>设计特点：</h3>
                    <ul>
                        <li>全钢制船体配合铝合金上层建筑</li>
                        <li>8个豪华客舱，可容纳12位贵宾</li>
                        <li>配备直升机停机坪</li>
                        <li>特大泳池和水疗中心</li>
                    </ul>
                    <p>Lana采用了多项环保技术，包括混合动力系统和先进的废水处理系统。</p>
                `,
                image: 'images/blog/yacht-review.jpg',
                date: '2024-02-10T14:30:00',
                source: 'Boat International',
                tags: ['超级游艇', 'Benetti', '游艇评测', '豪华游艇']
            },
            {
                id: '3',
                title: '游艇行业2024年发展趋势分析',
                category: 'news',
                content: `
                    <p>随着全球经济复苏，游艇行业在2024年展现出新的发展趋势。根据最新市场研究数据显示，以下几个方面将成为行业焦点：</p>
                    <h3>主要趋势：</h3>
                    <ol>
                        <li>电动游艇需求增长</li>
                        <li>智能化和自动化技术应用扩大</li>
                        <li>可持续材料使用增加</li>
                        <li>定制化服务更受欢迎</li>
                    </ol>
                    <p>专家预测，2024年全球游艇市场规模将达到xxx亿美元，年增长率约为12%。</p>
                `,
                image: 'images/blog/yacht-trend.jpg',
                date: '2024-02-05T09:15:00',
                source: '游艇产业研究院',
                tags: ['市场趋势', '游艇产业', '发展预测']
            },
            {
                id: '4',
                title: '迪拜游艇生活：体验奢华海上之旅',
                category: 'lifestyle',
                content: `
                    <p>迪拜作为全球顶级游艇旅游目的地，提供了独特的海上生活体验。无论是短途游览还是长期租赁，这里都能满足各类需求。</p>
                    <h3>推荐航线：</h3>
                    <ul>
                        <li>棕榈岛环游</li>
                        <li>世界岛观光</li>
                        <li>迪拜码头夜游</li>
                        <li>阿拉伯湾日落巡航</li>
                    </ul>
                    <p>除了观光，迪拜还提供钓鱼、潜水等多种海上活动选择。</p>
                `,
                image: 'images/blog/yacht-lifestyle.jpg',
                date: '2024-02-01T16:45:00',
                source: '迪拜旅游局',
                tags: ['游艇生活', '迪拜旅游', '海上活动', '奢华体验']
            }
        ];

        // 确保新文章显示在顶部
        this.articles = [...sampleArticles.reverse(), ...this.articles];
        localStorage.setItem('blogPosts', JSON.stringify(this.articles));
    }

    async loadArticles() {
        try {
            // 从localStorage获取文章数据
            this.articles = JSON.parse(localStorage.getItem('blogPosts')) || [];
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

        // 绑定搜索事件
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchArticles(e.target.value);
            });
        }
    }

    filterArticles(category) {
        let filteredArticles = this.articles;
        if (category !== 'all') {
            filteredArticles = this.articles.filter(article => article.category === category);
        }
        this.renderArticles(filteredArticles);
    }

    searchArticles(keyword) {
        const searchResults = this.articles.filter(article => {
            const searchText = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase();
            return searchText.includes(keyword.toLowerCase());
        });
        this.renderArticles(searchResults);
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