# ECharts Worker

Run echarts in web worker

## Install

Needs latest code of ECharts and ZRender.

Build with webpack@3

```bash
npm install
ln -s $ECPath node_modules/echarts
ln -s $ZRPath node_modules/zrender

webpack
```


## Roadmap

- Events
- Hover layer, layers
- Images
- Callback in Option
- GeoJSON data register
- Extension register
- measureText optimize