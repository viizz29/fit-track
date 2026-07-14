# input the domain name
read -p "Enter the domain name: " domain_name

cd ../frontend
echo -e "VITE_APP_NAME=App001\nVITE_MOCK_API_ON=false\nVITE_BACKEND_SERVER=https://$domain_name\nVITE_API_BASE_URL=" > .env.production
npm run build
cd ../backend
rm -rf ./public
cp -r ../frontend/.dist ./public
docker build -t fitrack:latest .

# check image contents:
# docker run --rm -it fitrack:latest sh