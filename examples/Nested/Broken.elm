port module Nested.Broken exposing (..)

import Json.Decode


port done : String -> Cmd msg


main : Platform.Program { nonsense : Int } () ()
main =
    Platform.programWithFlags
        { init = \_ -> ( (), done "" )
        , update = \_ _ -> ( (), Cmd.none )
        , subscriptions = \_ -> Sub.none
        }
