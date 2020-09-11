const net = require('net');

const contentMangler = (data) => {
    data = data.replace(/[^ -~\s]+/g, '');

    const asmrex = /^\.([C])(:)([0-9a-f]){4}\s{2}(([0-9a-f]+\s){1,4})\s*(\w{3})\s.*$/gim
    let replacements = {};
    let asmmatch;
    while(asmmatch = asmrex.exec(data)) {
        const cmd = asmmatch[6];
        if(cmd.startsWith('LD')) {
            replacements[asmmatch[0]] = colors.green(asmmatch[0]);
        }
        else if(cmd.startsWith('ST')) {
            replacements[asmmatch[0]] = colors.red(asmmatch[0]);
        }
        else if(cmd.startsWith('J') || cmd.startsWith('B')) {
            replacements[asmmatch[0]] = colors.yellow(asmmatch[0]);
        }
    }

    // FIXME DRY error. Should push all regexes into common location.
    const memrex = /^(\s*>)([C])(:)([0-9a-f]{4})(\s{2}(([0-9a-f]{2}\s){4}\s){4}\s)(.{16})/gim;
    let memmatch;
    while(memmatch = memrex.exec(data)) {
        const newString;
        newString.push(memmatch[1], memmatch[2], memmatch[3], memmatch[4]);
        const byteColors = [];
        let i = 0;
        const hex = memmatch[5].replace(/[0-9a-f]+\s/g, match => {
            const val = parseInt(match, 16);
            let col;
            if(!val) {
                col = colors.gray;
            }
            else {
                col = colors.reset;
            }

            byteColors.push(col(memmatch[8][i]))
            i++;
            return col(match);
        });

        newString.push(hex, byteColors.join(''));

        replacements[memmatch[0]] = newString.join('');
    }

    for(const orig in replacements) {
        const replacement = replacements[orig];
        data = data.replace(orig, replacement);
    }

    return data;
};

const textAddress = process.argv[process.argv.indexOf('-binarymonitoraddress') + 1];
const sock = new net.Socket();