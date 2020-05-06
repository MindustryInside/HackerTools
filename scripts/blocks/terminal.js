const terminal = extendContent(Block, "terminal", {

    // Loading texture regions 
    load() {
        this.super$load();
        this.region = Core.atlas.find(this.name);
        this.displayRegion = Core.atlas.find(this.name + "-display");
        this.caretRegion = Core.atlas.find(this.name + "-display-caret");
    },

    // Generate icons in block select menu
    generateIcons() {
        const terminalBase = Core.atlas.find(this.name);
        const terminalDisplay = Core.atlas.find(this.name + "-display-icon");
        return [terminalBase, terminalDisplay];
    },

    // Draw block
    draw(tile) {
        Draw.rect(this.region, tile.drawx(), tile.drawy());
        this.drawLayer(tile);
    },

    // Draw block display
    drawLayer(tile) {
        const entity = tile.ent();

        // If error draw red display instead blue
        Draw.color(entity.getError() ? Color.valueOf("E55454") : Color.valueOf("88A4FF"));

        Draw.rect(this.displayRegion, tile.drawx(), tile.drawy());

        // Caret flash
        if (Mathf.sin(Time.time(), 10, 1) > 0) {
            Draw.rect(this.caretRegion, tile.drawx(), tile.drawy());
        }
        Draw.reset();
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
                const dialog = new FloatingDialog(Core.bundle.get("block." + this.name + ".terminal-caption"));
                dialog.setFillParent(false);

                // Add text area to dialog
                const textArea = new TextArea(entity.getText());
                dialog.cont.add(textArea).size(380, 160);

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
                Log.info("[#ffea4a]" + this.localizedName + ": [] " + entity.getResult());
                entity.setError(false);

            } catch (err) { // If error appear print it instead crash the game

                // Log with [E] mark
                Log.err("[#ff5a54]" + this.localizedName + ": []" + err);
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

        getResult() {
            return this._result;
        },

        setResult(result) {
            this._result = result;
        },

        write(stream) {
            this.super$write(stream);
            stream.writeUTF(this.getText());
            stream.writeBoolean(this.getError());
            stream.writeUTF(this.getResult());
        },

        read(stream, revision) {
            this.super$read(stream, revision);
            this.setText(stream.readUTF());
            this.setError(stream.readBoolean());
            this.setResult(stream.readUTF());
        }
    });

    entity.setText("");
    entity.setError(false);

    return entity;
});
