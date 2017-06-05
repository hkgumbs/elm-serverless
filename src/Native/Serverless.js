var _user$project$Native_Serverless = {

  program: function(impl) {
      return function(_flagDecoder) {
          return function(object, _moduleName) {
              object['serverless'] = function(event, context, callback) {
                  var outcome = A2(impl, event, context);
                  callback(null, outcome);
              };
          };
      };
  }

};
