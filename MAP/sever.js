const http = require('http');
const fs = require('fs');
const path = require('path');

// 替代記憶體資料的方式（使用 JSON 文件模擬數據庫）
const dataFile = path.join(__dirname, 'recommendations.json');

// 檢查數據文件是否存在
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([])); // 初始化空數據
}

// 讀取數據文件內容
function readRecommendations() {
    const rawData = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(rawData);
}

// 寫入數據到文件
function saveRecommendations(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// 創建伺服器
http.createServer((req, res) => {
    if (req.url === '/recommendations' && req.method === 'GET') {
        // 返回推薦列表
        const recommendations = readRecommendations();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(recommendations));
    } else if (req.url === '/add-recommendation' && req.method === 'POST') {
        // 接收新增推薦請求
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const newRecommendation = JSON.parse(body);
                const recommendations = readRecommendations();
                recommendations.push(newRecommendation);
                saveRecommendations(recommendations);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '推薦已新增' }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '無效的資料格式' }));
            }
        });
    } else {
        // 提供靜態資源
        const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                const ext = path.extname(filePath);
                const contentType = ext === '.html' ? 'text/html' :
                                    ext === '.css' ? 'text/css' :
                                    ext === '.js' ? 'application/javascript' :
                                    'text/plain';

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    }
}).listen(3000, () => console.log('伺服器運行中: http://localhost:3000/index.html'));
