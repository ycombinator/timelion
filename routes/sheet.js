var Promise = require('bluebird');
var Boom = require('boom');


function replyWithError(e, reply) {
  reply({title: e.toString(), message: e.toString(), stack: e.stack}).code(400);
}


module.exports = function (server) {

  server.route({
    method: 'POST',
    path: '/timelion/sheet',
    handler: function (request, reply) {
      var tlConfig = require('../handlers/lib/tl_config.js')({
        server: server,
        request: request
      });
      var chainRunner = require('../handlers/chain_runner.js')(tlConfig);

      var sheet;
      try {
        sheet = chainRunner.processRequest(request.payload);
      } catch (e) {
        replyWithError(e, reply);
        return;
      }

      return Promise.all(sheet).then(function (sheet) {
        var response = {
          sheet: sheet,
          stats: chainRunner.getStats()
        };
        reply(response);
      }).catch(function (e) {
        // TODO Maybe we should just replace everywhere we throw with Boom? Probably.
        if (e.isBoom) {
          reply(e);
        } else {
          replyWithError(e, reply);
        }
      });
    }
  });

};
