module.exports = {
  packagerConfig: {
    asar: true,
    osxSign: false, // Disable code signing
    osxNotarize: false, // Disable notarization
    icon: './public/favicon',
    extraResource: [
      './public'
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        name: 'Zulu Wheel',
        icon: './public/favicon.ico',
        contents: options => {
          return [
            { x: 448, y: 344, type: 'link', path: '/Applications' },
            { x: 192, y: 344, type: 'file', path: options.appPath }
          ];
        }
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
}; 