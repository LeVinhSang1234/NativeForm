module.exports = {
  dependency: {
    platforms: {
      // The keyboard manager is an iOS only Fabric component. Android relies on
      // windowSoftInputMode, so autolinking is disabled there.
      android: null,
      ios: {},
    },
  },
};
