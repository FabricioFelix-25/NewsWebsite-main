import { defineConfig, mergeConfig } from 'vite';
import base from '../../vite.config';

export default mergeConfig(base, defineConfig({
  server: { proxy: { '/api/editor-images': 'http://127.0.0.1:19090' } },
}));
