## Configurations

### Souce configurations

```
- src/config
  - app.yml           // Default configurations
  - app.dev.yml       // Dev configurations, which has higher priority than app.yml
  - app.prod.yml      // Production configurations, which has higher priority than app.dev.yml
```

### Compile souce configurations

Use `yaml` file here

Run npm scripts:

```sh
npm run config:build
```

to generate configuration files to **src/config/dist**

### Options

```yaml
# Project Name
NAME: MadMachine

# Open DevTools by default
DEBUG: true

# Main window size at the first place
EDIT_WINDOW:
  WIDTH: 1200
  HEIGHT: 800
  # Target index page
  URL: views/edit.html

  SETTING_WINDOW:
    URL: views/setting.html

  SERIAL_WINDOW:
    URL: views/serial.html

  USER_WINDOW:
    URL: views/user.html

  ABOUT_WINDOW:
    URL: views/about.html

THEME:
  # Theme mode: black | white
  NAME: black
  # Theme color: BG_COLOR background-color
  STYLE:
    BLACK:
      BG_COLOR: '"#45475f"'
    WHITE:
      BG_COLOR: '"#ececec"'
```
