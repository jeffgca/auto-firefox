var program = require("commander");
var run = require("fx-runner");

program
  .version(0.1)
  .option("-b, --binary <path>", "Path of Firefox binary to use.")
  .option("--binary-args <CMDARGS>", "Pass additional arguments into Firefox.")
  .option("-p, --profile <path>", "Path or name of Firefox profile to use.")
  .option("-v, --verbose", "More verbose logging to stdout.")
  .option("--new-instance", "Use a new instance")
  .option("--no-remote", "Do not allow remote calls")
  .option("--foreground", "Bring Firefox to the foreground")
  .option("-l, --listen <port>", "Start the debugger server on a specific port.")

program
  .command("start")
  .description("Start Firefox")
  .action(function() {
    // console.log(program.startDebuggerServer);
    var port = program.listen || 6000;
    run({
      binary: program.binary || process.env.JPM_FIREFOX_BINARY || "firefox",
      profile: program.profile,
      "new-instance": !!program.newInstance ? true : false,
      "foreground": !!program.foreground ? true : false,
      "no-remote": !program.remote ? true : false,
      "binary-args": program.binaryArgs || "",
      "listen": port
    })
    .then(function(results) {
      var firefox = results.process;
      if (program.verbose) {
        firefox.stdout.pipe(process.stdout)
      }

      // connect to the runnign firefox via client.
      setTimeout(function() {
        console.log('attempting to connect on port %d', program.listen);

        var FirefoxClient = require("firefox-client");

        var client = new FirefoxClient();

        client.connect(port, function() {
          client.listTabs(function(err, tabs) {
            console.log("first tab:", tabs[0].url);
          });
        });
      }, 8000)
    }, console.exception);
  });

program.parse(process.argv);
