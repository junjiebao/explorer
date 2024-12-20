const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const mysql = require('mysql2/promise');
const excel = require('exceljs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// 添加这些中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: '服务器错误' });
});

// JWT密钥
const JWT_SECRET = 'your-secret-key';

// 数据库连接配置
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'explorer_yacht',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 确保存储目录存在
const STORAGE_DIR = path.join(__dirname, 'storage', 'surveys');
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// 管理员登录
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('收到登录请求:', { username }); // 添加日志
    
    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );
        connection.release();

        if (rows.length === 0) {
            console.log('用户不存在:', username);
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const admin = rows[0];
        const validPassword = await bcrypt.compare(password, admin.password);
        console.log('密码验证结果:', validPassword);

        if (!validPassword) {
            console.log('密码错误');
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username }, 
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('登录成功:', username);
        res.json({ token, username: admin.username });
    } catch (error) {
        console.error('登录处理错误:', error);
        res.status(500).json({ error: '登录失败，请稍后重试' });
    }
});

// 验证JWT中间件
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: '未授权' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: '无效的token' });
    }
};

// 获取调研列表（需要登录）
app.get('/api/admin/surveys', authenticateJWT, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM surveys ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('获取数据失败：', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 导出Excel（需要登录）
app.get('/api/admin/export', authenticateJWT, async (req, res) => {
    try {
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('调研数据');
        
        // 设置表头
        worksheet.columns = [
            { header: '提交时间', key: 'submit_time' },
            { header: '姓名', key: 'name' },
            { header: '联系方式', key: 'contact' },
            // ... 其他列
        ];

        // 获取数据
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM surveys');
        connection.release();

        // 添加数据
        worksheet.addRows(rows);

        // 发送文件
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=surveys.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: '导出失败' });
    }
});

// 提交调研表单
app.post('/api/submit-survey', async (req, res) => {
    try {
        const data = req.body;
        const timestamp = new Date();
        const formattedDate = timestamp.toISOString().split('T')[0];
        
        // 保存到数据库
        await pool.execute(
            'INSERT INTO surveys (data, submit_time) VALUES (?, ?)',
            [JSON.stringify(data), timestamp]
        );

        // 创建或更新当天的Excel文件
        const fileName = `surveys_${formattedDate}.xlsx`;
        const filePath = path.join(STORAGE_DIR, fileName);
        
        let workbook;
        if (fs.existsSync(filePath)) {
            workbook = await new ExcelJS.Workbook().xlsx.readFile(filePath);
        } else {
            workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('调研数据');
            
            // 设置表头
            worksheet.columns = [
                { header: '提交时间', key: 'submitTime', width: 20 },
                { header: '称谓', key: 'title', width: 10 },
                { header: '姓名', key: 'name', width: 15 },
                { header: '联系方式', key: 'contact', width: 20 },
                { header: '所在地区', key: 'location', width: 15 },
                { header: '驾驶经验', key: 'experience', width: 15 },
                { header: '新艇/二手艇', key: 'yacht_condition', width: 15 },
                { header: '尺寸范围', key: 'size_range', width: 15 },
                { header: '预算范围', key: 'budget', width: 20 },
                { header: '使用方式', key: 'usage', width: 30 },
                { header: '航行区域', key: 'cruising_area', width: 30 },
                { header: '年使用时间', key: 'usage_time', width: 15 },
                { header: '特殊设备需求', key: 'equipment', width: 30 },
                { header: '游艇管理服务', key: 'management_service', width: 15 },
                { header: '船员招募服务', key: 'crew_recruitment', width: 15 },
                { header: '其他需求说明', key: 'additional_notes', width: 40 }
            ];
        }

        // 添加新数据
        const worksheet = workbook.getWorksheet('调研数据');
        worksheet.addRow({
            submitTime: timestamp.toLocaleString(),
            ...data,
            usage: Array.isArray(data.usage) ? data.usage.join(', ') : data.usage,
            cruising_area: Array.isArray(data.cruising_area) ? data.cruising_area.join(', ') : data.cruising_area,
            equipment: Array.isArray(data.equipment) ? data.equipment.join(', ') : data.equipment
        });

        // 保存Excel文件
        await workbook.xlsx.writeFile(filePath);

        res.json({ success: true });
    } catch (error) {
        console.error('提交失败：', error);
        res.status(500).json({ error: '提交失败' });
    }
});

// 添加获取Excel文件列表的接口
app.get('/api/admin/survey-files', authenticateJWT, (req, res) => {
    try {
        const files = fs.readdirSync(STORAGE_DIR)
            .filter(file => file.endsWith('.xlsx'))
            .map(file => ({
                name: file,
                path: `/storage/surveys/${file}`,
                date: file.split('_')[1].split('.')[0]
            }))
            .sort((a, b) => b.date.localeCompare(a.date));

        res.json(files);
    } catch (error) {
        console.error('获取文件列表失败：', error);
        res.status(500).json({ error: '获取文件列表失败' });
    }
});

// 添加文件下载接口
app.get('/storage/surveys/:filename', authenticateJWT, (req, res) => {
    const filePath = path.join(STORAGE_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: '文件不存在' });
    }
});

// 初始化管理员账号
async function initializeAdmin() {
    try {
        const connection = await pool.getConnection();
        
        // 检查admins表是否存在
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 检查是否已存在管理员账号
        const [rows] = await connection.execute(
            'SELECT * FROM admins WHERE username = ?',
            ['JOEY.BAO@XINYOUTING.COM']
        );

        if (rows.length === 0) {
            // 创建新管理员账号
            const hashedPassword = await bcrypt.hash('Joey@8837', 10);
            await connection.execute(
                'INSERT INTO admins (username, password) VALUES (?, ?)',
                ['JOEY.BAO@XINYOUTING.COM', hashedPassword]
            );
            console.log('管理员账号创建成功');
        } else {
            // 更新现有账号的密码
            const hashedPassword = await bcrypt.hash('Joey@8837', 10);
            await connection.execute(
                'UPDATE admins SET password = ? WHERE username = ?',
                [hashedPassword, 'JOEY.BAO@XINYOUTING.COM']
            );
            console.log('管理员账号密码已更新');
        }

        connection.release();
    } catch (error) {
        console.error('初始化管理员账号失败：', error);
    }
}

// 在服务器启动时初始化管理员账号
app.listen(3000, () => {
    console.log('Server running on port 3000');
    initializeAdmin();
}); 