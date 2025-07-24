build:
	docker build -t wotc .

run-docker:
	docker run -it -p 8080:80 --rm wotc
