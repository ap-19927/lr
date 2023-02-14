# this script sets up a reverse proxy for the local road server, along with upgrading /peer to a WSS connection for the peerjs signaling server. c.f. https://github.com/peers/peerjs-server/issues/220
# then it deploys SSL certificates via certbot.
# for this script to work you will need certbot and nginx installed, along with the nginx service started, for example with sudo systemctl start nginx
# additionally, the line
# include /etc/nginx/conf.d/*.conf;
# is needed in the http block of /etc/nginx/nginx.conf
# this script will need to be modified to include an owned DOMAIN name which has been registered with the server's IP
sudo cat > /etc/nginx/conf.d/default0.conf << EOF
map \$http_upgrade \$connection_upgrade {
        default upgrade;
        ''      close;
}

server {
  server_name IP DOMAIN;
  location / {
    proxy_pass  http://localhost:9000;
  }
  location /peer {
    proxy_pass  http://localhost:9000;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \$connection_upgrade;
  }
}
EOF
sudo certbot --nginx
sudo nginx -t
sudo systemctl restart nginx
