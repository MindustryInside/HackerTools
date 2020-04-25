const terminal = extendContent(Block, "terminal", {

    // Generate icons in block select menu
    generateIcons() {
        if (this.error !== true && this.error !== false) this.error = false;

        const terminalBase = Core.atlas.find(modName + "-terminal");
        const terminalDisplayWhite = Core.atlas.find(modName + "-terminal-display-white");

        // Other icons:
        // const terminalDisplayBlue = Core.atlas.find(modName + "-terminal-display-blue");
        // const terminalDisplayOrange = Core.atlas.find(modName + "-terminal-display-orange");
        // const terminalDisplayRed = Core.atlas.find(modName + "-terminal-display-red");

        return [terminalBase, terminalDisplayWhite];
    },

    // Draw block
    draw(tile) {
        Draw.rect(this.name, tile.drawx(), tile.drawy());
        this.drawLayer(tile);
    },

    // Draw block display
    drawLayer(tile) {

        // If error draw red display instead blue
        const display = this.error
            ? Core.atlas.find(this.name + "-display-red")
            : Core.atlas.find(this.name + "-display-blue");

        Draw.rect(display, tile.drawx(), tile.drawy());
    },

    // Called when player clicks on block
    buildConfiguration(tile, table) {

        // Check if block has text
        if (!this.text) this.text = "";

        table.addImageButton(Icon.pencil, Styles.clearTransi, run(() => {
            if (Vars.mobile) {
                // Mobile and desktop version have different dialogs

                const input = new Input.TextInput();
                input.text = this.text;
                input.multiline = true;
                input.accepted = cons(out => this.text = out);

                Core.input.getTextInput(input);
            } else {
                // Create dialog
                const dialog = new FloatingDialog("Execute JavaScript");
                dialog.setFillParent(false);

                // Add text area to dialog
                const textArea = dialog.cont.add(new TextArea(this.text)).size(380, 160).get();

                // Add "ok" button to dialog
                dialog.buttons.addButton("$ok", run(() => {
                    this.text = textArea.getText();
                    dialog.hide();
                }));

                // Show it
                dialog.show();
            }
        })).size(40);

        table.addImageButton(Icon.ok, Styles.clearTransi, run(() => {
            try {

                // If there is no text in block return undefined
                // In other case put output to result var
                const result = this.text ? eval(this.text) : undefined;

                // Log with [I] mark
                Log.info("[#ffea4a]Terminal: [] " + result);
                this.error = false;

            } catch (err) { // If error appear print it instead crash the game

                // Log with [E] mark
                Log.err("[#ff5a54]Terminal: []" + err);
                this.error = true;
            }
        })).size(40);
    },
});