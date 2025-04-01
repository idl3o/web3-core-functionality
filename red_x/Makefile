CC = gcc
CFLAGS = -Wall -Wextra -std=c99
LDFLAGS = `sdl2-config --libs`
INCLUDES = `sdl2-config --cflags`

all: red_x

red_x: main.c
	$(CC) $(CFLAGS) $(INCLUDES) -o $@ $< $(LDFLAGS)

web: main.c template.html
	emcc $< -o index.html -s USE_SDL=2 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 \
		--shell-file template.html -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS=cwrap \
		-s ENVIRONMENT=web -s MODULARIZE=1

template.html:
	cp index.html template.html

node_modules: package.json
	npm install

serve: web node_modules
	node server.js

clean:
	rm -f red_x
	rm -f index.html index.js index.wasm template.html
