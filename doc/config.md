## 配置说明

### 配置文件说明

```
- src/config
  - app.yml           // 默认配置文件
  - app.dev.yml       // 开发环境配置文件，会覆盖默认配置文件中相同配置
  - app.prod.yml      // 正式环境配置文件，会覆盖默认配置文件中相同配置
```

### 配置文件编译

使用 yaml 文件配置，更加简明，灵活，注释等，减少打包提及。把配置文件编译提前到开发中。

运行

```
npm run config:build
```

编译配置文件到 **src/config/dist**文件夹中

### 配置项说明

```yaml
# 项目名字
NAME: MadMachine

# 是否开启调试窗口
DEBUG: true

# 主窗口第一次打开默认大小
EDIT_WINDOW:
  WIDTH: 1200
  HEIGHT: 800
  # 加载的页面地址
  URL: views/edit.html

  # 设置窗口
  SETTING_WINDOW:
    URL: views/setting.html

  # 串口通讯窗口
  SERIAL_WINDOW:
    URL: views/serial.html

  # 用户登录窗口
  USER_WINDOW:
    URL: views/user.html

  # 关于窗口
  ABOUT_WINDOW:
    URL: views/about.html

# 主题
THEME:
  # 主题类型， black 黑色， white 白色
  NAME: black
  # 主题窗口样式  BG_COLOR 背景色
  STYLE:
    BLACK:
      BG_COLOR: '"#45475f"'
    WHITE:
      BG_COLOR: '"#ececec"'
```
