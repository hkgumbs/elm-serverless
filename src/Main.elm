module Main exposing (..)

import Serverless


main : Serverless.Program
main =
    Serverless.program <|
        \a b ->
            { code = 200, body = "Hello, from Elm!" }
