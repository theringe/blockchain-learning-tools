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
			$("#public_address_hex_nocomm").val("");
			$("#public_address_hex_comm").val("");
			$("#public_address_sha_nocomm").val("");
			$("#public_address_sha_comm").val("");
			$("#public_address_emd_nocomm").val("");
			$("#public_address_emd_comm").val("");
			$("#public_address_chk_nocomm").val("");
			$("#public_address_chk_comm").val("");
			$("#public_address_nocomm").val("");
			$("#public_address_comm").val("");
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
			//public_key_hex - (public_address_hex_nocomm + public_address_hex_comm)
			var public_address_hex_x = public_key_hex.substring(2, 66);
			var public_address_hex_y = public_key_hex.substring(66, 130);
			var public_address_hex_nocomm = public_key_hex;
			$("#public_address_hex_nocomm").val(public_key_hex);
			var public_address_hex_comm = '';
			var public_address_hex_y_chk = public_address_hex_y.split("").pop();
			if ($.inArray(public_address_hex_y_chk, ['0', '2', '4', '6', '8', 'a', 'c', 'e']) != -1) {
				public_address_hex_comm = "02" + public_address_hex_x;
				$("#public_address_hex_comm").val(public_address_hex_comm);
			} else {
				public_address_hex_comm = "03" + public_address_hex_x;
				$("#public_address_hex_comm").val(public_address_hex_comm);
			}
			//(public_address_hex_nocomm + public_address_hex_comm) - (public_address_sha_nocomm + public_address_sha_comm)
			var public_address_sha_nocomm = sha256(conv(public_address_hex_nocomm, { in:'hex' }));
			$("#public_address_sha_nocomm").val(public_address_sha_nocomm);
			var public_address_sha_comm = sha256(conv(public_address_hex_comm, { in:'hex' }));
			$("#public_address_sha_comm").val(public_address_sha_comm);
			//(public_address_sha_nocomm + public_address_sha_comm) - (public_address_emd_nocomm + public_address_emd_comm)
			var public_address_emd_nocomm = new RIPEMD160().update(conv(public_address_sha_nocomm, { in:'hex' })).digest('hex');
			$("#public_address_emd_nocomm").val(public_address_emd_nocomm);
			var public_address_emd_comm = new RIPEMD160().update(conv(public_address_sha_comm, { in:'hex' })).digest('hex');
			$("#public_address_emd_comm").val(public_address_emd_comm);
			//(public_address_emd_nocomm + public_address_emd_comm) - (public_address_chk_nocomm + public_address_chk_comm)
			var public_address_chk_nocomm = sha256(conv(sha256(conv("00"+public_address_emd_nocomm, { in:'hex' })), { in:'hex' }));
			public_address_chk_nocomm = public_address_chk_nocomm.substring(0, 8);
			$("#public_address_chk_nocomm").val(public_address_chk_nocomm);
			var public_address_chk_comm = sha256(conv(sha256(conv("00"+public_address_emd_comm, { in:'hex' })), { in:'hex' }));
			public_address_chk_comm = public_address_chk_comm.substring(0, 8);
			$("#public_address_chk_comm").val(public_address_chk_comm);
			//(public_address_nocomm + public_address_comm)
			var public_address_nocomm = bs58.encode(new Buffer("00"+public_address_emd_nocomm+public_address_chk_nocomm, 'hex'))
			$("#public_address_nocomm").val(public_address_nocomm);
			var public_address_comm = bs58.encode(new Buffer("00"+public_address_emd_comm+public_address_chk_comm, 'hex'))
			$("#public_address_comm").val(public_address_comm);
		} catch(err) {
			$("#errmsg").val(err.message);
		}
	});
});
