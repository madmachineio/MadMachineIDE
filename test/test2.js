// const usbDetect = require('usb-detection')
// const usb = require('usb')

// const drivelist = require('drivelist')

// drivelist.list().then((drives) => {
//   console.log(JSON.stringify(drives))
// })

// usbDetect.startMonitoring()

// // console.log(usb.getDeviceList())
// usbDetect.find('8137', '147', (err, device) => {
//   console.log('add', device)

//   // console.log(usb.)
//   // console.log(usb)
// })

function sum(a, b) {
  return a + b;
}

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
