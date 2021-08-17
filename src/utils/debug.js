const DEBUG = !!process.env.DEBUG

function debug(...args) {
  if (DEBUG) {
    console.log(...args)
  }
}

module.exports = debug
