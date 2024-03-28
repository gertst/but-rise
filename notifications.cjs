const express = require('express')
const app = express()
const path = require('path')
const WindowsToaster = require('node-notifier/notifiers/toaster')
const notifier = new WindowsToaster()
const { spawn } = require('child_process')

let lastMessage = ''

// Configure Express to serve static files with correct MIME types
app.use(express.static(path.join(__dirname, 'dist')))

// Render the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// Handle fetches at '/notify'
app.post('/notify', express.json(), (req, res) => {
  // console.log('Received notification:', req.body)
  notify(req.body.message)

  // Optionally send a response back to the client
  res.json({ message: 'Notification received successfully!' })
})

const notify = (msg) => {
  console.log('notify:', msg)
  lastMessage = msg
  notifier.notify(
    {
      title: 'B.U.T Rise!',
      message: msg,
      icon: path.join(__dirname, 'public/icon.png'),
      actions: ['OK', 'Open App']
    },
    (err, data) => {
      // Will also wait until notification is closed.
      console.log('Waited')

      console.log(JSON.stringify({ err, data }, null, '\t'))
      if (data === 'timeout') {
        notify(lastMessage)
      } else if (data === 'open app') {
        console.log('ope apppp!')
        // const url = 'https://www.example.com'

        var url = 'http://localhost:3000'
        var start =
          process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open'
        require('child_process').exec(start + ' ' + url)

        // if (process.platform === 'darwin') {
        //   spawn('open', [url])
        // } else if (process.platform === 'win32') {
        //   spawn('start', ['open', url])
        // } else {
        //   spawn('xdg-open', [url])
        // }
      }
    }
  )
}
