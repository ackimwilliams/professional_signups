.PHONY: backend frontend check-docker start stop

check-docker:
	@docker info >/dev/null 2>&1 || (echo "Docker is not running, start docker and retry." && exit 1)

backend: check-docker
	@echo "Building and starting api service..."
	@cd backend && touch db.sqlite3 && chmod 666 db.sqlite3
	@cd backend && docker compose up --build -d
	@echo "Backend running on http://localhost:8000"
	@echo "(cloud storage) console on http://localhost:9001"

seed: check-docker
	@echo "Seeding database..."
	@cd backend && docker compose exec web python manage.py migrate
	@cd backend && docker compose exec web python manage.py seed

frontend: check-docker
	@echo "Building frontend image..."
	@docker build -t newtonx-frontend --build-arg VITE_API_URL=http://localhost:8000/api frontend
	@echo "Starting frontend container..."
	@docker rm -f newtonx-frontend >/dev/null 2>&1 || true
	@docker run -d --name newtonx-frontend -p 5173:80 newtonx-frontend >/dev/null
	@echo "Frontend running on http://localhost:5173"

	@echo "Opening browser..."
	@command -v open >/dev/null 2>&1 && open http://localhost:5173 || true
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:5173 || true

start: check-docker # check for docker first
	@$(MAKE) backend
	@echo "Waiting for backend to be ready..."
	@for i in 1 2 3 4 5 6 7 8 9 10; do \
		if curl -fsS http://localhost:8000/api/professionals/ >/dev/null 2>&1; then \
			echo "Backend is ready."; \
			break; \
		fi; \
		echo "  ... waiting"; \
		sleep 2; \
	done
	@$(MAKE) frontend

stop: check-docker
	@echo "Stopping frontend container..."
	@docker rm -f newtonx-frontend >/dev/null 2>&1 || true
	@echo "Stopping backend containers..."
	@cd backend && docker compose down
	@docker rm -f web minio minio-init >/dev/null 2>&1 || true
