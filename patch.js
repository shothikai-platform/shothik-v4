const fs = require('fs');

let content = fs.readFileSync('src/components/agent/InputArea.jsx', 'utf8');

content = content.replace(
  '<Button disabled={loading} type="submit" size="icon">',
  `<Tooltip>
            <TooltipTrigger asChild>
              <span
                className="focus-visible:ring-2 focus-visible:ring-ring rounded-md flex"
                tabIndex={loading ? 0 : undefined}
              >
                <Button disabled={loading} type="submit" size="icon" aria-label="Send message">`
);

content = content.replace(
  /<\/Button>\s*<\/div>\s*<\/form>/,
  `</Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send message</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </form>`
);

content = content.replace(
  /<Button\s+variant="ghost"\s+size="icon"\s+onClick=\{\(\) => setSelectedAgent\(null\)\}\s+className="h-9 w-9"\s*>/,
  `<Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedAgent(null)}
            className="h-9 w-9"
            aria-label="Back to agents"
          >`
);

content = content.replace(
  /<Button\s+variant="ghost"\s+size="icon"\s+type="button"\s+onClick=\{handleFileInputClick\}\s+className="group relative"\s*>/,
  `<Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleFileInputClick}
                className="group relative"
                aria-label="Attach files"
              >`
);

fs.writeFileSync('src/components/agent/InputArea.jsx', content);
