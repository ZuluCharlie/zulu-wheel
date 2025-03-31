const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require("path");

module.exports = {
  packagerConfig: {
    asar: true,
    osxSign: false, // Disable code signing
    osxNotarize: false, // Disable notarization
    icon: path.join(__dirname, 'public/favicon.ico'),
    extraResource: ['./src/assets'],
    name: 'zulu-wheel',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        loadingGif: path.join(__dirname, 'public/ZSpin.gif'),
        iconUrl: path.join(__dirname, 'public/favicon.ico'),
        setupIcon: path.join(__dirname, 'public/favicon.ico'),
        noMsi: true,
      },
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        icon: 'public/favicon.ico',
        maintainer: 'ZuluCharlie',
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {
        icon: 'public/favicon.ico',
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        format: 'ULFO',
        icon: 'public/favicon.ico',
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux', 'win32']
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {
        icon: path.join(__dirname, 'public/favicon.ico'),
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'ZuluCharlie',
          name: 'zulu-wheel'
        },
        prerelease: true,
        draft: false
      }
    }
  ]
};