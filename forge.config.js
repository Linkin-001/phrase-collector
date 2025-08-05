// Removed FusesPlugin due to ES Module compatibility issues

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './build/icon', // 图标路径（不需要扩展名）
    name: 'Phrase Collector',
    executableName: 'phrase-collector',
    appBundleId: 'com.drawspace.phrase.collector',
    appCategoryType: 'public.app-category.productivity',
    win32metadata: {
      CompanyName: 'DrawSpace',
      ProductName: 'Phrase Collector'
    }
  },
  rebuildConfig: {
    force: false,
    onlyModules: []
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'phrase-collector',
        setupIcon: './build/icon.ico',
        iconUrl: './build/icon.ico'
      },
      platforms: ['win32']
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: 'Phrase Collector',
        icon: './build/icon.icns'
      },
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'DrawSpace',
          homepage: 'https://github.com/drawspace/phrase-collector'
        }
      },
      platforms: ['linux']
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'DrawSpace',
          homepage: 'https://github.com/drawspace/phrase-collector'
        }
      },
      platforms: ['linux']
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/main.js',
            config: 'vite.main.config.js',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.js',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.config.js',
          },
        ],
      },
    },
  ],
};
