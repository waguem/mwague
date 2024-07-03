#!/usr/bin/env bash

export_keyclaok_settings(){
    container_name=$1
    docker exec -it $container_name /opt/keycloak/bin/kc.sh export --realm mwague --dir /tmp/export
    docker cp $container_name:/tmp/export .
}

import_keyclaok_settings(){
    container_name=$1
    docker cp ./export $container_name:/tmp
    docker exec -it $container_name /opt/keycloak/bin/kc.sh import --dir /tmp/export
    # restart the container to apply the changes
    docker restart $container_name
}

# Check if the correct number of arguments is passed
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <container_name> <export|import>"
    exit 1
fi

container_name=$1
action=$2

# Execute the appropriate function based on the action argument
case $action in
    export)
        export_keyclaok_settings "$container_name"
        ;;
    import)
        import_keyclaok_settings "$container_name"
        ;;
    *)
        echo "Invalid action: $action. Use 'export' or 'import'."
        exit 2
        ;;
esac
