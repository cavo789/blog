.PHONY: tags-manager
tags-manager: ## Tags manager
	@clear
ifeq ($(strip $(ARGS)),)
	@echo "--------------------------------------------------------"
	@echo "🚨 ERROR: Missing command arguments (ARGS)."
	@echo "--------------------------------------------------------"
	@echo "USAGE EXAMPLE:"
	@echo "  make tags-manager ARGS=\"delete tag\""
	@echo ""
	@echo "  make tags-manager ARGS=\"list\""
	@echo "  make tags-manager ARGS=\"list --sort count\""
	@echo "  make tags-manager ARGS=\"list --sort name\""
	@echo ""
	@echo "  make tags-manager ARGS=\"rename old,new\""
	@echo ""
	@echo "  make tags-manager ARGS=\"--help\""
	@echo ""
	@echo "For full help, run: make tags-manager ARGS=\"--help\""
	@echo "--------------------------------------------------------"
	@exit 1
else
	@echo "--- Running Tags Manager with arguments: $(ARGS) ---"
	docker run -it --rm -v ${PWD}:/app -w /app python sh -c "pip install oyaml python-frontmatter > /dev/null 2>&1 && python .scripts/tags-manager.py $(ARGS)"
endif
