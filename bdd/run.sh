#!/usr/bin/env bash
cd /app/tests
echo "Running Behave Tests"
env

api_url=$1

# check if curl is installed
if ! [ -x "$(command -v curl)" ]; then
    echo 'Error: curl is not installed.' >&2
    apt update && apt install curl -y
fi


run(){
    behave --tags=@init -k
    behave --tags=@initialize -k
    #behave --tags=~@init --tags=~@initialize -k
}
wait_for_it(){
    api_url=$1

    while true; do
        echo "Waiting for $api_url to be ready"
        # get ping response
        pong=$(curl -s $api_url)
        echo "health: $pong"
        # pong should be {"ping":"pong"}

        if [ "$pong" == '{"health":"UP"}' ]; then
            echo "$api_url is ready"
            break
        fi
        sleep 5
    done
}


main(){
    wait_for_it $api_url
    run
}

main
