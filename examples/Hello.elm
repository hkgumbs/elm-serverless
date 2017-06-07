port module Hello exposing (..)

import Json.Decode


port done : String -> Cmd msg


main : Platform.Program {} () ()
main =
    Platform.programWithFlags
        { init = \_ -> ( (), done "Hello, from Elm!" )
        , update = \_ _ -> ( (), Cmd.none )
        , subscriptions = \_ -> Sub.none
        }
