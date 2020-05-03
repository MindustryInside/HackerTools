const terminal = extendContent(Block, "terminal", {

    // Generate icons in block select menu
    generateIcons() {
        const terminalBase = Core.atlas.find(this.name);
        const terminalDisplayWhite = Core.atlas.find(this.name + "-display-white");
        return [terminalBase, terminalDisplayWhite];
    },

    // Draw block
    draw(tile) {
        Draw.rect(this.name, tile.drawx(), tile.drawy());
        this.drawLayer(tile);
    },

    // Draw block display
    drawLayer(tile) {
        const entity = tile.ent();

        // If error draw red display instead blue
        Draw.rect(Core.atlas.find(
            this.name + (entity.getError() ? "-display-red" : "-display-blue")
        ), tile.drawx(), tile.drawy());

        // Flash
        if (Mathf.sin(Time.time(), 10, 1) > 0) {
            Draw.rect(Core.atlas.find(
                this.name + (entity.getError() ? "-display-red" : "-display-blue") + "-caret"
            ), tile.drawx(), tile.drawy());
        }
    },

    // Called when player clicks on block
    buildConfiguration(tile, table) {
        const entity = tile.ent();

        // Add buttons
        table.addImageButton(Icon.pencil, Styles.clearTransi, run(() => {
            if (Vars.mobile) {

                // Mobile and desktop version have different dialogs
                const input = new Input.TextInput();
                input.text = entity.getText();
                input.multiline = true;
                input.accepted = cons(text => entity.setText(text));

                Core.input.getTextInput(input);
            } else {
                // Create dialog
                const dialog = new FloatingDialog("Execute JavaScript");
                dialog.setFillParent(false);

                // Add text area to dialog
                const textArea = dialog.cont.add(new TextArea(entity.getText())).size(380, 160).get();

                // Add "ok" button to dialog
                dialog.buttons.addButton("$ok", run(() => {
                    entity.setText(textArea.getText());
                    dialog.hide();
                }));

                // Show it
                dialog.show();
            }
        })).size(40);

        table.addImageButton(Icon.ok, Styles.clearTransi, run(() => {
            try {

                // If there is no text in block return undefined
                // In other case put output to entity._result
                entity.setResult(entity.getText()
                    ? eval.bind(Vars.mods.getScripts(), entity.getText())()
                    : undefined);

                // Log with [I] mark
                Log.info("[#ffea4a]Terminal: [] " + entity.getResult());
                entity.setError(false);

            } catch (err) { // If error appear print it instead crash the game

                // Log with [E] mark
                Log.err("[#ff5a54]Terminal: []" + err);
                entity.setError(true);
            }
        })).size(40);
    },
});

terminal.entityType = prov(() => {
    const entity = extend(TileEntity, {
        getText() {
            return this._text;
        },

        setText(text) {
            this._text = text;
        },

        getError() {
            return this._error;
        },

        setError(error) {
            this._error = error;
        },

        setResult(result) {
            this._result = result;
        },

        getResult() {
            return this._result;
        }
    });

    entity.setText("");
    entity.setError(false);

    return entity;
});
