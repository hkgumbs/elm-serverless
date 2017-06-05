module Serverless exposing (..)

import Native.Serverless


type alias Program =
    Platform.Program Never () ()


program : (a -> b -> c) -> Program
program =
    Native.Serverless.program
