var bs58 = require('bs58');
var elliptic = require('elliptic').ec('secp256k1');
var sha256 = require('sha256');
var conv = require('binstring');
var RIPEMD160 = require('ripemd160');

$(document).ready(function(){
	$("#private_address").on("change paste keyup", function() {
		try {
			//init
			$("#errmsg").val("");
			$("#private_key_hex").val("");
			$("#private_address_valid").val("");
			$("#public_key_hex").val("");
			$("#public_address_hex").val("");
			$("#public_address_sha").val("");
			$("#public_address_emd").val("");
			$("#public_address_chk").val("");
			$("#public_address").val("");
			//private_address - private_address_hex
			var private_address     = $("#private_address").val();
			var private_address_hex = bs58.decode(private_address);
			private_address_hex = new Buffer(private_address_hex).toString('hex');
			$("#private_address_hex").val(private_address_hex);
			//private_address_hex - private_key_hex (private_address_valid)
			if (private_address_hex.length == 0) {
			} else if (private_address_hex.length == 74) {
				//not compress
				$("#private_address_valid").val("normal format");
				var private_key_hex = private_address_hex.substring(2, 66);
				$("#private_key_hex").val(private_key_hex);
			} else if (private_address_hex.length == 76) {
				//compress
				if (private_address_hex.substring(66, 68) != '01') {
					$("#private_address_valid").val("not valid");
				} else {
					$("#private_address_valid").val("compressed format");
					var private_key_hex = private_address_hex.substring(2, 66);
					$("#private_key_hex").val(private_key_hex);
				}
			} else {
				$("#private_address_valid").val("not valid");
			}
			//private_key_hex - public_key_hex
			var public_key_hex = elliptic.keyFromPrivate(private_key_hex).getPublic('hex');
			$("#public_key_hex").val(public_key_hex);
			//public_key_hex - public_address_hex
			var public_address_hex_x = public_key_hex.substring(2, 66);
			var public_address_hex_y = public_key_hex.substring(66, 130);
			var public_address_hex = '';
			var public_address_hex_y_chk = public_address_hex_y.split("").pop();
			var private_address_valid = $("#private_address_valid").val();
			if (private_address_valid == 'normal format') {
				public_address_hex = public_key_hex;
			} else if (private_address_valid == 'compressed format') {
				if ($.inArray(public_address_hex_y_chk, ['0', '2', '4', '6', '8', 'a', 'c', 'e']) != -1) {
					public_address_hex = "02" + public_address_hex_x;
				} else {
					public_address_hex = "03" + public_address_hex_x;
				}
			} else {
				public_address_hex = '';
			}
			$("#public_address_hex").val(public_address_hex);
			//public_address_hex - public_address_sha
			var public_address_sha = sha256(conv(public_address_hex, { in:'hex' }));
			$("#public_address_sha").val(public_address_sha);
			//public_address_sha - public_address_emd
			var public_address_emd = new RIPEMD160().update(conv(public_address_sha, { in:'hex' })).digest('hex');
			$("#public_address_emd").val(public_address_emd);
			//public_address_emd - public_address_chk
			var public_address_chk = sha256(conv(sha256(conv("00"+public_address_emd, { in:'hex' })), { in:'hex' }));
			public_address_chk = public_address_chk.substring(0, 8);
			$("#public_address_chk").val(public_address_chk);
			//public_address
			var public_address = bs58.encode(new Buffer("00"+public_address_emd+public_address_chk, 'hex'))
			$("#public_address").val(public_address);
		} catch(err) {
			$("#errmsg").val(err.message);
		}
	});
});
