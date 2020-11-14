const Terminal = extendContent(Block, "terminal", {

    // Loading texture regions 
    load() {
        this.super$load();
        this.region = Core.atlas.find(this.name);
        this.displayRegion = Core.atlas.find(this.name + "-display");
        this.caretRegion = Core.atlas.find(this.name + "-display-caret");
    },

    // Generate icons in block select menu
    icons() {
        const terminalBase = Core.atlas.find(this.name);
        const terminalDisplay = Core.atlas.find(this.name + "-display-icon");
        return [terminalBase, terminalDisplay];
    },
});

Terminal.buildType = prov(() => {
    const TerminalBuild = extend(Building, {

        // Draw block
        draw() {
            Draw.rect(Terminal.region, tile.drawx(), tile.drawy());
            this.drawLayer();
        },
	    
        // Draw block display
        drawLayer() {
	    
            // If error draw red display instead blue
            Draw.color(this.getError() ? Color.valueOf("E55454") : Color.valueOf("88A4FF"));
	    
            Draw.rect(Terminal.displayRegion, tile.drawx(), tile.drawy());
	    
            // Caret flash
            if (Mathf.sin(Time.time(), 10, 1) > 0) {
                Draw.rect(Terminal.caretRegion, tile.drawx(), tile.drawy());
            }
            Draw.reset();
        },
	    
        // Called when player clicks on block
        buildConfiguration(table) {
	    
            // Add buttons
            table.button(Icon.pencil, () => {
                if (Vars.mobile) {
	    
                    // Mobile and desktop version have different dialogs
                    const input = new Input.TextInput();
                    input.text = this.getText();
                    input.multiline = true;
                    input.accepted = cons(text => this.setText(text));
	    
                    Core.input.getTextInput(input);
                } else {
                    // Create dialog
                    const dialog = new BaseDialog(Core.bundle.get("block." + Terminal.name + ".terminal-caption"));
                    dialog.setFillParent(false);
	    
                    // Add text area to dialog
                    const textArea = new TextArea(this.getText());
                    dialog.cont.add(textArea).size(380, 160);
	    
                    // Add "ok" button to dialog
                    dialog.buttons.button("@ok", run(() => {
                        this.setText(textArea.getText());
                        dialog.hide();
                    }));
	    
                    // Show it
                    dialog.show();
                }
				this.deselect();
            }).size(40);
	    
            table.button(Icon.terminal, () => {
                try {
	    
                    // If there is no text in block return undefined
                    // In other case put output to entity._result
                    this.setResult(this.getText()
                        ? eval.bind(Vars.mods.getScripts(), this.getText())()
                        : undefined);
	    
                    // Log with [I] mark
                    Log.info("[#ffea4a]" + this.localizedName + ": [] " + this.getResult());
                    this.setError(false);
	    
                } catch (err) { // If error appear print it instead crash the game
	    
                    // Log with [E] mark
                    Log.err("[#ff5a54]" + this.localizedName + ": []" + err);
                    this.setError(true);
                }
            }).size(40);
        },

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
			stream.str(this.getText().toString());
			stream.bool(this.getError());
        },

        read(stream, revision) {
            this.super$read(stream, revision);
			this.setText(stream.str());
			this.setError(stream.bool());
        }
    });

    return TerminalBuild;
});
