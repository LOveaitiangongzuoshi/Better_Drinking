# Better_Drinking
onpe
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>Better_Drinking 模组 Bug 收集</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; }
        .bug-form { margin-top: 20px; }
        .bug-form input, .bug-form textarea { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
        .bug-form button { background: #3498db; color: white; border: none; padding: 12px 30px; border-radius: 5px; cursor: pointer; }
        .bug-form button:hover { background: #2980b9; }
        .footer { margin-top: 30px; color: #7f8c8d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐛 Better_Drinking 模组 Bug 收集</h1>
        <p>感谢你使用 Better_Drinking！如果你在游戏中遇到任何问题，请在此提交，我们会尽快处理。</p>
        
        <div class="bug-form">
            <h3>提交 Bug 报告</h3>
            <form action="https://api.github.com/repos/LOveaitiangongzuoshi/Better_Drinking/issues" method="POST">
                <input type="text" placeholder="你的游戏版本 (例如 1.19.2)" required>
                <input type="text" placeholder="问题简述 (例如：喝水时崩溃)" required>
                <textarea rows="5" placeholder="请详细描述出现问题的步骤..." required></textarea>
                <button type="submit">提交 Issue</button>
            </form>
            <p style="color:#e74c3c; font-size:14px;">⚠️ 点击提交会跳转到 GitHub，需要你登录账号并确认创建 Issue。</p>
        </div>
        
        <div class="footer">
            <p>📌 也可以直接在 <a href="https://github.com/LOveaitiangongzuoshi/Better_Drinking/issues" target="_blank">GitHub Issues 页面</a> 提交反馈</p>
        </div>
    </div>
</body>
</html>
