(function (GLOBAL) { //lib_btc v1.0.1
    /* Utility Libraries required
     * All credits for these codes belong to their respective creators, moderators and owners.
     * For more info (including license and terms of use), please visit respective source.
     */

    //sha512.js
    (function () {
        /*
            A JavaScript implementation of the SHA family of hashes, as defined in FIPS
            PUB 180-2 as well as the corresponding HMAC implementation as defined in
            FIPS PUB 198a
           
            Copyright Brian Turek 2008-2012
            Distributed under the BSD License
            See http://caligatio.github.com/jsSHA/ for more information
           
            Several functions taken from Paul Johnson
           */
        function n(a) {
            throw a;
        }
        var q = null;

        function s(a, b) {
            this.a = a;
            this.b = b
        }

        function u(a, b) {
            var d = [],
                h = (1 << b) - 1,
                f = a.length * b,
                g;
            for (g = 0; g < f; g += b) d[g >>> 5] |= (a.charCodeAt(g / b) & h) << 32 - b - g % 32;
            return {
                value: d,
                binLen: f
            }
        }

        function x(a) {
            var b = [],
                d = a.length,
                h, f;
            0 !== d % 2 && n("String of HEX type must be in byte increments");
            for (h = 0; h < d; h += 2) f = parseInt(a.substr(h, 2), 16), isNaN(f) && n("String of HEX type contains invalid characters"), b[h >>> 3] |= f << 24 - 4 * (h % 8);
            return {
                value: b,
                binLen: 4 * d
            }
        }

        function B(a) {
            var b = [],
                d = 0,
                h, f, g, k, m; - 1 === a.search(/^[a-zA-Z0-9=+\/]+$/) && n("Invalid character in base-64 string");
            h = a.indexOf("=");
            a = a.replace(/\=/g, ""); - 1 !== h && h < a.length && n("Invalid '=' found in base-64 string");
            for (f = 0; f < a.length; f += 4) {
                m = a.substr(f, 4);
                for (g = k = 0; g < m.length; g += 1) h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(m[g]), k |= h << 18 - 6 * g;
                for (g = 0; g < m.length - 1; g += 1) b[d >> 2] |= (k >>> 16 - 8 * g & 255) << 24 - 8 * (d % 4), d += 1
            }
            return {
                value: b,
                binLen: 8 * d
            }
        }

        function E(a, b) {
            var d = "",
                h = 4 * a.length,
                f, g;
            for (f = 0; f < h; f += 1) g = a[f >>> 2] >>> 8 * (3 - f % 4), d += "0123456789abcdef".charAt(g >>> 4 & 15) + "0123456789abcdef".charAt(g & 15);
            return b.outputUpper ? d.toUpperCase() : d
        }

        function F(a, b) {
            var d = "",
                h = 4 * a.length,
                f, g, k;
            for (f = 0; f < h; f += 3) {
                k = (a[f >>> 2] >>> 8 * (3 - f % 4) & 255) << 16 | (a[f + 1 >>> 2] >>> 8 * (3 - (f + 1) % 4) & 255) << 8 | a[f + 2 >>> 2] >>> 8 * (3 - (f + 2) % 4) & 255;
                for (g = 0; 4 > g; g += 1) d = 8 * f + 6 * g <= 32 * a.length ? d + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k >>> 6 * (3 - g) & 63) : d + b.b64Pad
            }
            return d
        }

        function G(a) {
            var b = {
                outputUpper: !1,
                b64Pad: "="
            };
            try {
                a.hasOwnProperty("outputUpper") && (b.outputUpper = a.outputUpper), a.hasOwnProperty("b64Pad") && (b.b64Pad = a.b64Pad)
            } catch (d) { }
            "boolean" !== typeof b.outputUpper && n("Invalid outputUpper formatting option");
            "string" !== typeof b.b64Pad && n("Invalid b64Pad formatting option");
            return b
        }

        function H(a, b) {
            var d = q,
                d = new s(a.a, a.b);
            return d = 32 >= b ? new s(d.a >>> b | d.b << 32 - b & 4294967295, d.b >>> b | d.a << 32 - b & 4294967295) : new s(d.b >>> b - 32 | d.a << 64 - b & 4294967295, d.a >>> b - 32 | d.b << 64 - b & 4294967295)
        }

        function I(a, b) {
            var d = q;
            return d = 32 >= b ? new s(a.a >>> b, a.b >>> b | a.a << 32 - b & 4294967295) : new s(0, a.a >>> b - 32)
        }

        function J(a, b, d) {
            return new s(a.a & b.a ^ ~a.a & d.a, a.b & b.b ^ ~a.b & d.b)
        }

        function U(a, b, d) {
            return new s(a.a & b.a ^ a.a & d.a ^ b.a & d.a, a.b & b.b ^ a.b & d.b ^ b.b & d.b)
        }

        function V(a) {
            var b = H(a, 28),
                d = H(a, 34);
            a = H(a, 39);
            return new s(b.a ^ d.a ^ a.a, b.b ^ d.b ^ a.b)
        }

        function W(a) {
            var b = H(a, 14),
                d = H(a, 18);
            a = H(a, 41);
            return new s(b.a ^ d.a ^ a.a, b.b ^ d.b ^ a.b)
        }

        function X(a) {
            var b = H(a, 1),
                d = H(a, 8);
            a = I(a, 7);
            return new s(b.a ^ d.a ^ a.a, b.b ^ d.b ^ a.b)
        }

        function Y(a) {
            var b = H(a, 19),
                d = H(a, 61);
            a = I(a, 6);
            return new s(b.a ^ d.a ^ a.a, b.b ^ d.b ^ a.b)
        }

        function Z(a, b) {
            var d, h, f;
            d = (a.b & 65535) + (b.b & 65535);
            h = (a.b >>> 16) + (b.b >>> 16) + (d >>> 16);
            f = (h & 65535) << 16 | d & 65535;
            d = (a.a & 65535) + (b.a & 65535) + (h >>> 16);
            h = (a.a >>> 16) + (b.a >>> 16) + (d >>> 16);
            return new s((h & 65535) << 16 | d & 65535, f)
        }

        function aa(a, b, d, h) {
            var f, g, k;
            f = (a.b & 65535) + (b.b & 65535) + (d.b & 65535) + (h.b & 65535);
            g = (a.b >>> 16) + (b.b >>> 16) + (d.b >>> 16) + (h.b >>> 16) + (f >>> 16);
            k = (g & 65535) << 16 | f & 65535;
            f = (a.a & 65535) + (b.a & 65535) + (d.a & 65535) + (h.a & 65535) + (g >>> 16);
            g = (a.a >>> 16) + (b.a >>> 16) + (d.a >>> 16) + (h.a >>> 16) + (f >>> 16);
            return new s((g & 65535) << 16 | f & 65535, k)
        }

        function ba(a, b, d, h, f) {
            var g, k, m;
            g = (a.b & 65535) + (b.b & 65535) + (d.b & 65535) + (h.b & 65535) + (f.b & 65535);
            k = (a.b >>> 16) + (b.b >>> 16) + (d.b >>> 16) + (h.b >>> 16) + (f.b >>> 16) + (g >>> 16);
            m = (k & 65535) << 16 | g & 65535;
            g = (a.a & 65535) + (b.a & 65535) + (d.a & 65535) + (h.a & 65535) + (f.a & 65535) + (k >>> 16);
            k = (a.a >>> 16) + (b.a >>> 16) + (d.a >>> 16) + (h.a >>> 16) + (f.a >>> 16) + (g >>> 16);
            return new s((k & 65535) << 16 | g & 65535, m)
        }

        function $(a, b, d) {
            var h, f, g, k, m, j, A, C, K, e, L, v, l, M, t, p, y, z, r, N, O, P, Q, R, c, S, w = [],
                T, D;
            "SHA-384" === d || "SHA-512" === d ? (L = 80, h = (b + 128 >>> 10 << 5) + 31, M = 32, t = 2, c = s, p = Z, y = aa, z = ba, r = X, N = Y, O = V, P = W, R = U, Q = J, S = [new c(1116352408, 3609767458), new c(1899447441, 602891725), new c(3049323471, 3964484399), new c(3921009573, 2173295548), new c(961987163, 4081628472), new c(1508970993, 3053834265), new c(2453635748, 2937671579), new c(2870763221, 3664609560), new c(3624381080, 2734883394), new c(310598401, 1164996542), new c(607225278, 1323610764),
            new c(1426881987, 3590304994), new c(1925078388, 4068182383), new c(2162078206, 991336113), new c(2614888103, 633803317), new c(3248222580, 3479774868), new c(3835390401, 2666613458), new c(4022224774, 944711139), new c(264347078, 2341262773), new c(604807628, 2007800933), new c(770255983, 1495990901), new c(1249150122, 1856431235), new c(1555081692, 3175218132), new c(1996064986, 2198950837), new c(2554220882, 3999719339), new c(2821834349, 766784016), new c(2952996808, 2566594879), new c(3210313671, 3203337956), new c(3336571891,
                1034457026), new c(3584528711, 2466948901), new c(113926993, 3758326383), new c(338241895, 168717936), new c(666307205, 1188179964), new c(773529912, 1546045734), new c(1294757372, 1522805485), new c(1396182291, 2643833823), new c(1695183700, 2343527390), new c(1986661051, 1014477480), new c(2177026350, 1206759142), new c(2456956037, 344077627), new c(2730485921, 1290863460), new c(2820302411, 3158454273), new c(3259730800, 3505952657), new c(3345764771, 106217008), new c(3516065817, 3606008344), new c(3600352804, 1432725776), new c(4094571909,
                    1467031594), new c(275423344, 851169720), new c(430227734, 3100823752), new c(506948616, 1363258195), new c(659060556, 3750685593), new c(883997877, 3785050280), new c(958139571, 3318307427), new c(1322822218, 3812723403), new c(1537002063, 2003034995), new c(1747873779, 3602036899), new c(1955562222, 1575990012), new c(2024104815, 1125592928), new c(2227730452, 2716904306), new c(2361852424, 442776044), new c(2428436474, 593698344), new c(2756734187, 3733110249), new c(3204031479, 2999351573), new c(3329325298, 3815920427), new c(3391569614,
                        3928383900), new c(3515267271, 566280711), new c(3940187606, 3454069534), new c(4118630271, 4000239992), new c(116418474, 1914138554), new c(174292421, 2731055270), new c(289380356, 3203993006), new c(460393269, 320620315), new c(685471733, 587496836), new c(852142971, 1086792851), new c(1017036298, 365543100), new c(1126000580, 2618297676), new c(1288033470, 3409855158), new c(1501505948, 4234509866), new c(1607167915, 987167468), new c(1816402316, 1246189591)
            ], e = "SHA-384" === d ? [new c(3418070365, 3238371032), new c(1654270250, 914150663),
            new c(2438529370, 812702999), new c(355462360, 4144912697), new c(1731405415, 4290775857), new c(41048885895, 1750603025), new c(3675008525, 1694076839), new c(1203062813, 3204075428)
            ] : [new c(1779033703, 4089235720), new c(3144134277, 2227873595), new c(1013904242, 4271175723), new c(2773480762, 1595750129), new c(1359893119, 2917565137), new c(2600822924, 725511199), new c(528734635, 4215389547), new c(1541459225, 327033209)]) : n("Unexpected error in SHA-2 implementation");
            a[b >>> 5] |= 128 << 24 - b % 32;
            a[h] = b;
            T = a.length;
            for (v = 0; v <
                T; v += M) {
                b = e[0];
                h = e[1];
                f = e[2];
                g = e[3];
                k = e[4];
                m = e[5];
                j = e[6];
                A = e[7];
                for (l = 0; l < L; l += 1) w[l] = 16 > l ? new c(a[l * t + v], a[l * t + v + 1]) : y(N(w[l - 2]), w[l - 7], r(w[l - 15]), w[l - 16]), C = z(A, P(k), Q(k, m, j), S[l], w[l]), K = p(O(b), R(b, h, f)), A = j, j = m, m = k, k = p(g, C), g = f, f = h, h = b, b = p(C, K);
                e[0] = p(b, e[0]);
                e[1] = p(h, e[1]);
                e[2] = p(f, e[2]);
                e[3] = p(g, e[3]);
                e[4] = p(k, e[4]);
                e[5] = p(m, e[5]);
                e[6] = p(j, e[6]);
                e[7] = p(A, e[7])
            }
            "SHA-384" === d ? D = [e[0].a, e[0].b, e[1].a, e[1].b, e[2].a, e[2].b, e[3].a, e[3].b, e[4].a, e[4].b, e[5].a, e[5].b] : "SHA-512" === d ? D = [e[0].a, e[0].b,
            e[1].a, e[1].b, e[2].a, e[2].b, e[3].a, e[3].b, e[4].a, e[4].b, e[5].a, e[5].b, e[6].a, e[6].b, e[7].a, e[7].b
            ] : n("Unexpected error in SHA-2 implementation");
            return D
        }
        GLOBAL.jsSHA = function (a, b, d) {
            var h = q,
                f = q,
                g = 0,
                k = [0],
                m = 0,
                j = q,
                m = "undefined" !== typeof d ? d : 8;
            8 === m || 16 === m || n("charSize must be 8 or 16");
            "HEX" === b ? (0 !== a.length % 2 && n("srcString of HEX type must be in byte increments"), j = x(a), g = j.binLen, k = j.value) : "ASCII" === b || "TEXT" === b ? (j = u(a, m), g = j.binLen, k = j.value) : "B64" === b ? (j = B(a), g = j.binLen, k = j.value) : n("inputFormat must be HEX, TEXT, ASCII, or B64");
            this.getHash = function (a, b, d) {
                var e = q,
                    m = k.slice(),
                    j = "";
                switch (b) {
                    case "HEX":
                        e = E;
                        break;
                    case "B64":
                        e = F;
                        break;
                    default:
                        n("format must be HEX or B64")
                }
                "SHA-384" ===
                    a ? (q === h && (h = $(m, g, a)), j = e(h, G(d))) : "SHA-512" === a ? (q === f && (f = $(m, g, a)), j = e(f, G(d))) : n("Chosen SHA variant is not supported");
                return j
            };
            this.getHMAC = function (a, b, d, e, f) {
                var h, l, j, t, p, y = [],
                    z = [],
                    r = q;
                switch (e) {
                    case "HEX":
                        h = E;
                        break;
                    case "B64":
                        h = F;
                        break;
                    default:
                        n("outputFormat must be HEX or B64")
                }
                "SHA-384" === d ? (j = 128, p = 384) : "SHA-512" === d ? (j = 128, p = 512) : n("Chosen SHA variant is not supported");
                "HEX" === b ? (r = x(a), t = r.binLen, l = r.value) : "ASCII" === b || "TEXT" === b ? (r = u(a, m), t = r.binLen, l = r.value) : "B64" === b ? (r = B(a),
                    t = r.binLen, l = r.value) : n("inputFormat must be HEX, TEXT, ASCII, or B64");
                a = 8 * j;
                b = j / 4 - 1;
                j < t / 8 ? (l = $(l, t, d), l[b] &= 4294967040) : j > t / 8 && (l[b] &= 4294967040);
                for (j = 0; j <= b; j += 1) y[j] = l[j] ^ 909522486, z[j] = l[j] ^ 1549556828;
                d = $(z.concat($(y.concat(k), a + g, d)), a + p, d);
                return h(d, G(f))
            }
        };
    })();

    //coin.js
    (function () {
        /*
                Coinjs 0.01 beta by OutCast3k{at}gmail.com
                A bitcoin framework.
                http://github.com/OutCast3k/coinjs or http://coinb.in/coinjs
        */
        var coinjs = GLOBAL.coinjs = function () { };

        /* public vars */
        coinjs.pub = 0x00;
        coinjs.priv = 0x80;
        coinjs.multisig = 0x05;
        coinjs.hdkey = {
            'prv': 0x0488ade4,
            'pub': 0x0488b21e
        };
        coinjs.bech32 = {
            'charset': 'qpzry9x8gf2tvdw0s3jn54khce6mua7l',
            'version': 0,
            'hrp': 'bc'
        };

        coinjs.compressed = false;

        /* other vars */
        coinjs.developer = '33tht1bKDgZVxb39MnZsWa8oxHXHvUYE4G'; //bitcoin

        /* bit(coinb.in) api vars */
        coinjs.hostname = ((document.location.hostname.split(".")[(document.location.hostname.split(".")).length - 1]) == 'onion') ? 'coinbin3ravkwb24f7rmxx6w3snkjw45jhs5lxbh3yfeg3vpt6janwqd.onion' : 'coinb.in';
        coinjs.host = ('https:' == document.location.protocol ? 'https://' : 'http://') + coinjs.hostname + '/api/';
        coinjs.uid = '1';
        coinjs.key = '12345678901234567890123456789012';

        /* start of address functions */

        /* generate a private and public keypair, with address and WIF address */
        coinjs.newKeys = function (input) {
            var privkey = (input) ? Crypto.SHA256(input) : this.newPrivkey();
            var pubkey = this.newPubkey(privkey);
            return {
                'privkey': privkey,
                'pubkey': pubkey,
                'address': this.pubkey2address(pubkey),
                'wif': this.privkey2wif(privkey),
                'compressed': this.compressed
            };
        }

        /* generate a new random private key */
        coinjs.newPrivkey = function () {
            var x = GLOBAL.location;
            x += (GLOBAL.screen.height * GLOBAL.screen.width * GLOBAL.screen.colorDepth);
            x += coinjs.random(64);
            x += (GLOBAL.screen.availHeight * GLOBAL.screen.availWidth * GLOBAL.screen.pixelDepth);
            x += navigator.language;
            x += GLOBAL.history.length;
            x += coinjs.random(64);
            x += navigator.userAgent;
            x += 'coinb.in';
            x += (Crypto.util.randomBytes(64)).join("");
            x += x.length;
            var dateObj = new Date();
            x += dateObj.getTimezoneOffset();
            x += coinjs.random(64);
            x += (document.getElementById("entropybucket")) ? document.getElementById("entropybucket").innerHTML : '';
            x += x + '' + x;
            var r = x;
            for (i = 0; i < (x).length / 25; i++) {
                r = Crypto.SHA256(r.concat(x));
            }
            var checkrBigInt = new BigInteger(r);
            var orderBigInt = new BigInteger("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
            while (checkrBigInt.compareTo(orderBigInt) >= 0 || checkrBigInt.equals(BigInteger.ZERO) || checkrBigInt.equals(BigInteger.ONE)) {
                r = Crypto.SHA256(r.concat(x));
                checkrBigInt = new BigInteger(r);
            }
            return r;
        }

        /* generate a public key from a private key */
        coinjs.newPubkey = function (hash) {
            var privateKeyBigInt = BigInteger.fromByteArrayUnsigned(Crypto.util.hexToBytes(hash));
            var curve = EllipticCurve.getSECCurveByName("secp256k1");

            var curvePt = curve.getG().multiply(privateKeyBigInt);
            var x = curvePt.getX().toBigInteger();
            var y = curvePt.getY().toBigInteger();

            var publicKeyBytes = EllipticCurve.integerToBytes(x, 32);
            publicKeyBytes = publicKeyBytes.concat(EllipticCurve.integerToBytes(y, 32));
            publicKeyBytes.unshift(0x04);

            if (coinjs.compressed == true) {
                var publicKeyBytesCompressed = EllipticCurve.integerToBytes(x, 32)
                if (y.isEven()) {
                    publicKeyBytesCompressed.unshift(0x02)
                } else {
                    publicKeyBytesCompressed.unshift(0x03)
                }
                return Crypto.util.bytesToHex(publicKeyBytesCompressed);
            } else {
                return Crypto.util.bytesToHex(publicKeyBytes);
            }
        }

        /* provide a public key and return address */
        coinjs.pubkey2address = function (h, byte) {
            var r = ripemd160(Crypto.SHA256(Crypto.util.hexToBytes(h), {
                asBytes: true
            }));
            r.unshift(byte || coinjs.pub);
            var hash = Crypto.SHA256(Crypto.SHA256(r, {
                asBytes: true
            }), {
                asBytes: true
            });
            var checksum = hash.slice(0, 4);
            return coinjs.base58encode(r.concat(checksum));
        }

        /* provide a scripthash and return address */
        coinjs.scripthash2address = function (h) {
            var x = Crypto.util.hexToBytes(h);
            x.unshift(coinjs.pub);
            var r = x;
            r = Crypto.SHA256(Crypto.SHA256(r, {
                asBytes: true
            }), {
                asBytes: true
            });
            var checksum = r.slice(0, 4);
            return coinjs.base58encode(x.concat(checksum));
        }

        /* new multisig address, provide the pubkeys AND required signatures to release the funds */
        coinjs.pubkeys2MultisigAddress = function (pubkeys, required) {
            var s = coinjs.script();
            s.writeOp(81 + (required * 1) - 1); //OP_1
            for (var i = 0; i < pubkeys.length; ++i) {
                s.writeBytes(Crypto.util.hexToBytes(pubkeys[i]));
            }
            s.writeOp(81 + pubkeys.length - 1); //OP_1 
            s.writeOp(174); //OP_CHECKMULTISIG
            var x = ripemd160(Crypto.SHA256(s.buffer, {
                asBytes: true
            }), {
                asBytes: true
            });
            x.unshift(coinjs.multisig);
            var r = x;
            r = Crypto.SHA256(Crypto.SHA256(r, {
                asBytes: true
            }), {
                asBytes: true
            });
            var checksum = r.slice(0, 4);
            var redeemScript = Crypto.util.bytesToHex(s.buffer);
            var address = coinjs.base58encode(x.concat(checksum));

            if (s.buffer.length > 520) { // too large
                address = 'invalid';
                redeemScript = 'invalid';
            }

            return {
                'address': address,
                'redeemScript': redeemScript,
                'size': s.buffer.length
            };
        }

        /* new time locked address, provide the pubkey and time necessary to unlock the funds.
           when time is greater than 500000000, it should be a unix timestamp (seconds since epoch),
           otherwise it should be the block height required before this transaction can be released. 

           may throw a string on failure!
        */
        coinjs.simpleHodlAddress = function (pubkey, checklocktimeverify) {

            if (checklocktimeverify < 0) {
                throw "Parameter for OP_CHECKLOCKTIMEVERIFY is negative.";
            }

            var s = coinjs.script();
            if (checklocktimeverify <= 16 && checklocktimeverify >= 1) {
                s.writeOp(0x50 + checklocktimeverify); //OP_1 to OP_16 for minimal encoding
            } else {
                s.writeBytes(coinjs.numToScriptNumBytes(checklocktimeverify));
            }
            s.writeOp(177); //OP_CHECKLOCKTIMEVERIFY
            s.writeOp(117); //OP_DROP
            s.writeBytes(Crypto.util.hexToBytes(pubkey));
            s.writeOp(172); //OP_CHECKSIG

            var x = ripemd160(Crypto.SHA256(s.buffer, {
                asBytes: true
            }), {
                asBytes: true
            });
            x.unshift(coinjs.multisig);
            var r = x;
            r = Crypto.SHA256(Crypto.SHA256(r, {
                asBytes: true
            }), {
                asBytes: true
            });
            var checksum = r.slice(0, 4);
            var redeemScript = Crypto.util.bytesToHex(s.buffer);
            var address = coinjs.base58encode(x.concat(checksum));

            return {
                'address': address,
                'redeemScript': redeemScript
            };
        }

        /* create a new segwit address */
        coinjs.segwitAddress = function (pubkey) {
            var keyhash = [0x00, 0x14].concat(ripemd160(Crypto.SHA256(Crypto.util.hexToBytes(pubkey), {
                asBytes: true
            }), {
                asBytes: true
            }));
            var x = ripemd160(Crypto.SHA256(keyhash, {
                asBytes: true
            }), {
                asBytes: true
            });
            x.unshift(coinjs.multisig);
            var r = x;
            r = Crypto.SHA256(Crypto.SHA256(r, {
                asBytes: true
            }), {
                asBytes: true
            });
            var checksum = r.slice(0, 4);
            var address = coinjs.base58encode(x.concat(checksum));

            return {
                'address': address,
                'type': 'segwit',
                'redeemscript': Crypto.util.bytesToHex(keyhash)
            };
        }

        /* create a new segwit bech32 encoded address */
        coinjs.bech32Address = function (pubkey) {
            var program = ripemd160(Crypto.SHA256(Crypto.util.hexToBytes(pubkey), {
                asBytes: true
            }), {
                asBytes: true
            });
            var address = coinjs.bech32_encode(coinjs.bech32.hrp, [coinjs.bech32.version].concat(coinjs.bech32_convert(program, 8, 5, true)));
            return {
                'address': address,
                'type': 'bech32',
                'redeemscript': Crypto.util.bytesToHex(program)
            };
        }

        /* extract the redeemscript from a bech32 address */
        coinjs.bech32redeemscript = function (address) {
            var r = false;
            var decode = coinjs.bech32_decode(address);
            if (decode) {
                decode.data.shift();
                return Crypto.util.bytesToHex(coinjs.bech32_convert(decode.data, 5, 8, false));
            }
            return r;
        }

        /* provide a privkey and return an WIF  */
        coinjs.privkey2wif = function (h) {
            var r = Crypto.util.hexToBytes(h);

            if (coinjs.compressed == true) {
                r.push(0x01);
            }

            r.unshift(coinjs.priv);
            var hash = Crypto.SHA256(Crypto.SHA256(r, {
                asBytes: true
            }), {
                asBytes: true
            });
            var checksum = hash.slice(0, 4);

            return coinjs.base58encode(r.concat(checksum));
        }

        /* convert a wif key back to a private key */
        coinjs.wif2privkey = function (wif) {
            var compressed = false;
            var decode = coinjs.base58decode(wif);
            var key = decode.slice(0, decode.length - 4);
            key = key.slice(1, key.length);
            if (key.length >= 33 && key[key.length - 1] == 0x01) {
                key = key.slice(0, key.length - 1);
                compressed = true;
            }
            return {
                'privkey': Crypto.util.bytesToHex(key),
                'compressed': compressed
            };
        }

        /* convert a wif to a pubkey */
        coinjs.wif2pubkey = function (wif) {
            var compressed = coinjs.compressed;
            var r = coinjs.wif2privkey(wif);
            coinjs.compressed = r['compressed'];
            var pubkey = coinjs.newPubkey(r['privkey']);
            coinjs.compressed = compressed;
            return {
                'pubkey': pubkey,
                'compressed': r['compressed']
            };
        }

        /* convert a wif to a address */
        coinjs.wif2address = function (wif) {
            var r = coinjs.wif2pubkey(wif);
            return {
                'address': coinjs.pubkey2address(r['pubkey']),
                'compressed': r['compressed']
            };
        }

        /* decode or validate an address and return the hash */
        coinjs.addressDecode = function (addr) {
            try {
                var bytes = coinjs.base58decode(addr);
                var front = bytes.slice(0, bytes.length - 4);
                var back = bytes.slice(bytes.length - 4);
                var checksum = Crypto.SHA256(Crypto.SHA256(front, {
                    asBytes: true
                }), {
                    asBytes: true
                }).slice(0, 4);
                if (checksum + "" == back + "") {

                    var o = {};
                    o.bytes = front.slice(1);
                    o.version = front[0];

                    if (o.version == coinjs.pub) { // standard address
                        o.type = 'standard';

                    } else if (o.version == coinjs.multisig) { // multisig address
                        o.type = 'multisig';

                    } else if (o.version == coinjs.priv) { // wifkey
                        o.type = 'wifkey';

                    } else if (o.version == 42) { // stealth address
                        o.type = 'stealth';

                        o.option = front[1];
                        if (o.option != 0) {
                            alert("Stealth Address option other than 0 is currently not supported!");
                            return false;
                        };

                        o.scankey = Crypto.util.bytesToHex(front.slice(2, 35));
                        o.n = front[35];

                        if (o.n > 1) {
                            alert("Stealth Multisig is currently not supported!");
                            return false;
                        };

                        o.spendkey = Crypto.util.bytesToHex(front.slice(36, 69));
                        o.m = front[69];
                        o.prefixlen = front[70];

                        if (o.prefixlen > 0) {
                            alert("Stealth Address Prefixes are currently not supported!");
                            return false;
                        };
                        o.prefix = front.slice(71);

                    } else { // everything else
                        o.type = 'other'; // address is still valid but unknown version
                    }

                    return o;
                } else {
                    throw "Invalid checksum";
                }
            } catch (e) {
                bech32rs = coinjs.bech32redeemscript(addr);
                if (bech32rs) {
                    return {
                        'type': 'bech32',
                        'redeemscript': bech32rs
                    };
                } else {
                    return false;
                }
            }
        }

        /* retreive the balance from a given address */
        coinjs.addressBalance = function (address, callback) {
            coinjs.ajax(coinjs.host + '?uid=' + coinjs.uid + '&key=' + coinjs.key + '&setmodule=addresses&request=bal&address=' + address + '&r=' + Math.random(), callback, "GET");
        }

        /* decompress an compressed public key */
        coinjs.pubkeydecompress = function (pubkey) {
            if ((typeof (pubkey) == 'string') && pubkey.match(/^[a-f0-9]+$/i)) {
                var curve = EllipticCurve.getSECCurveByName("secp256k1");
                try {
                    var pt = curve.curve.decodePointHex(pubkey);
                    var x = pt.getX().toBigInteger();
                    var y = pt.getY().toBigInteger();

                    var publicKeyBytes = EllipticCurve.integerToBytes(x, 32);
                    publicKeyBytes = publicKeyBytes.concat(EllipticCurve.integerToBytes(y, 32));
                    publicKeyBytes.unshift(0x04);
                    return Crypto.util.bytesToHex(publicKeyBytes);
                } catch (e) {
                    // console.log(e);
                    return false;
                }
            }
            return false;
        }

        coinjs.bech32_polymod = function (values) {
            var chk = 1;
            var BECH32_GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
            for (var p = 0; p < values.length; ++p) {
                var top = chk >> 25;
                chk = (chk & 0x1ffffff) << 5 ^ values[p];
                for (var i = 0; i < 5; ++i) {
                    if ((top >> i) & 1) {
                        chk ^= BECH32_GENERATOR[i];
                    }
                }
            }
            return chk;
        }

        coinjs.bech32_hrpExpand = function (hrp) {
            var ret = [];
            var p;
            for (p = 0; p < hrp.length; ++p) {
                ret.push(hrp.charCodeAt(p) >> 5);
            }
            ret.push(0);
            for (p = 0; p < hrp.length; ++p) {
                ret.push(hrp.charCodeAt(p) & 31);
            }
            return ret;
        }

        coinjs.bech32_verifyChecksum = function (hrp, data) {
            return coinjs.bech32_polymod(coinjs.bech32_hrpExpand(hrp).concat(data)) === 1;
        }

        coinjs.bech32_createChecksum = function (hrp, data) {
            var values = coinjs.bech32_hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
            var mod = coinjs.bech32_polymod(values) ^ 1;
            var ret = [];
            for (var p = 0; p < 6; ++p) {
                ret.push((mod >> 5 * (5 - p)) & 31);
            }
            return ret;
        }

        coinjs.bech32_encode = function (hrp, data) {
            var combined = data.concat(coinjs.bech32_createChecksum(hrp, data));
            var ret = hrp + '1';
            for (var p = 0; p < combined.length; ++p) {
                ret += coinjs.bech32.charset.charAt(combined[p]);
            }
            return ret;
        }

        coinjs.bech32_decode = function (bechString) {
            var p;
            var has_lower = false;
            var has_upper = false;
            for (p = 0; p < bechString.length; ++p) {
                if (bechString.charCodeAt(p) < 33 || bechString.charCodeAt(p) > 126) {
                    return null;
                }
                if (bechString.charCodeAt(p) >= 97 && bechString.charCodeAt(p) <= 122) {
                    has_lower = true;
                }
                if (bechString.charCodeAt(p) >= 65 && bechString.charCodeAt(p) <= 90) {
                    has_upper = true;
                }
            }
            if (has_lower && has_upper) {
                return null;
            }
            bechString = bechString.toLowerCase();
            var pos = bechString.lastIndexOf('1');
            if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
                return null;
            }
            var hrp = bechString.substring(0, pos);
            var data = [];
            for (p = pos + 1; p < bechString.length; ++p) {
                var d = coinjs.bech32.charset.indexOf(bechString.charAt(p));
                if (d === -1) {
                    return null;
                }
                data.push(d);
            }
            if (!coinjs.bech32_verifyChecksum(hrp, data)) {
                return null;
            }
            return {
                hrp: hrp,
                data: data.slice(0, data.length - 6)
            };
        }

        coinjs.bech32_convert = function (data, inBits, outBits, pad) {
            var value = 0;
            var bits = 0;
            var maxV = (1 << outBits) - 1;

            var result = [];
            for (var i = 0; i < data.length; ++i) {
                value = (value << inBits) | data[i];
                bits += inBits;

                while (bits >= outBits) {
                    bits -= outBits;
                    result.push((value >> bits) & maxV);
                }
            }

            if (pad) {
                if (bits > 0) {
                    result.push((value << (outBits - bits)) & maxV);
                }
            } else {
                if (bits >= inBits) throw new Error('Excess padding');
                if ((value << (outBits - bits)) & maxV) throw new Error('Non-zero padding');
            }

            return result;
        }

        coinjs.testdeterministicK = function () {
            // https://github.com/bitpay/bitcore/blob/9a5193d8e94b0bd5b8e7f00038e7c0b935405a03/test/crypto/ecdsa.js
            // Line 21 and 22 specify digest hash and privkey for the first 2 test vectors.
            // Line 96-117 tells expected result.

            var tx = coinjs.transaction();

            var test_vectors = [{
                'message': 'test data',
                'privkey': 'fee0a1f7afebf9d2a5a80c0c98a31c709681cce195cbcd06342b517970c0be1e',
                'k_bad00': 'fcce1de7a9bcd6b2d3defade6afa1913fb9229e3b7ddf4749b55c4848b2a196e',
                'k_bad01': '727fbcb59eb48b1d7d46f95a04991fc512eb9dbf9105628e3aec87428df28fd8',
                'k_bad15': '398f0e2c9f79728f7b3d84d447ac3a86d8b2083c8f234a0ffa9c4043d68bd258'
            },
            {
                'message': 'Everything should be made as simple as possible, but not simpler.',
                'privkey': '0000000000000000000000000000000000000000000000000000000000000001',
                'k_bad00': 'ec633bd56a5774a0940cb97e27a9e4e51dc94af737596a0c5cbb3d30332d92a5',
                'k_bad01': 'df55b6d1b5c48184622b0ead41a0e02bfa5ac3ebdb4c34701454e80aabf36f56',
                'k_bad15': 'def007a9a3c2f7c769c75da9d47f2af84075af95cadd1407393dc1e26086ef87'
            },
            {
                'message': 'Satoshi Nakamoto',
                'privkey': '0000000000000000000000000000000000000000000000000000000000000002',
                'k_bad00': 'd3edc1b8224e953f6ee05c8bbf7ae228f461030e47caf97cde91430b4607405e',
                'k_bad01': 'f86d8e43c09a6a83953f0ab6d0af59fb7446b4660119902e9967067596b58374',
                'k_bad15': '241d1f57d6cfd2f73b1ada7907b199951f95ef5ad362b13aed84009656e0254a'
            },
            {
                'message': 'Diffie Hellman',
                'privkey': '7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f',
                'k_bad00': 'c378a41cb17dce12340788dd3503635f54f894c306d52f6e9bc4b8f18d27afcc',
                'k_bad01': '90756c96fef41152ac9abe08819c4e95f16da2af472880192c69a2b7bac29114',
                'k_bad15': '7b3f53300ab0ccd0f698f4d67db87c44cf3e9e513d9df61137256652b2e94e7c'
            },
            {
                'message': 'Japan',
                'privkey': '8080808080808080808080808080808080808080808080808080808080808080',
                'k_bad00': 'f471e61b51d2d8db78f3dae19d973616f57cdc54caaa81c269394b8c34edcf59',
                'k_bad01': '6819d85b9730acc876fdf59e162bf309e9f63dd35550edf20869d23c2f3e6d17',
                'k_bad15': 'd8e8bae3ee330a198d1f5e00ad7c5f9ed7c24c357c0a004322abca5d9cd17847'
            },
            {
                'message': 'Bitcoin',
                'privkey': 'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
                'k_bad00': '36c848ffb2cbecc5422c33a994955b807665317c1ce2a0f59c689321aaa631cc',
                'k_bad01': '4ed8de1ec952a4f5b3bd79d1ff96446bcd45cabb00fc6ca127183e14671bcb85',
                'k_bad15': '56b6f47babc1662c011d3b1f93aa51a6e9b5f6512e9f2e16821a238d450a31f8'
            },
            {
                'message': 'i2FLPP8WEus5WPjpoHwheXOMSobUJVaZM1JPMQZq',
                'privkey': 'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
                'k_bad00': '6e9b434fcc6bbb081a0463c094356b47d62d7efae7da9c518ed7bac23f4e2ed6',
                'k_bad01': 'ae5323ae338d6117ce8520a43b92eacd2ea1312ae514d53d8e34010154c593bb',
                'k_bad15': '3eaa1b61d1b8ab2f1ca71219c399f2b8b3defa624719f1e96fe3957628c2c4ea'
            },
            {
                'message': 'lEE55EJNP7aLrMtjkeJKKux4Yg0E8E1SAJnWTCEh',
                'privkey': '3881e5286abc580bb6139fe8e83d7c8271c6fe5e5c2d640c1f0ed0e1ee37edc9',
                'k_bad00': '5b606665a16da29cc1c5411d744ab554640479dd8abd3c04ff23bd6b302e7034',
                'k_bad01': 'f8b25263152c042807c992eacd2ac2cc5790d1e9957c394f77ea368e3d9923bd',
                'k_bad15': 'ea624578f7e7964ac1d84adb5b5087dd14f0ee78b49072aa19051cc15dab6f33'
            },
            {
                'message': '2SaVPvhxkAPrayIVKcsoQO5DKA8Uv5X/esZFlf+y',
                'privkey': '7259dff07922de7f9c4c5720d68c9745e230b32508c497dd24cb95ef18856631',
                'k_bad00': '3ab6c19ab5d3aea6aa0c6da37516b1d6e28e3985019b3adb388714e8f536686b',
                'k_bad01': '19af21b05004b0ce9cdca82458a371a9d2cf0dc35a813108c557b551c08eb52e',
                'k_bad15': '117a32665fca1b7137a91c4739ac5719fec0cf2e146f40f8e7c21b45a07ebc6a'
            },
            {
                'message': '00A0OwO2THi7j5Z/jp0FmN6nn7N/DQd6eBnCS+/b',
                'privkey': '0d6ea45d62b334777d6995052965c795a4f8506044b4fd7dc59c15656a28f7aa',
                'k_bad00': '79487de0c8799158294d94c0eb92ee4b567e4dc7ca18addc86e49d31ce1d2db6',
                'k_bad01': '9561d2401164a48a8f600882753b3105ebdd35e2358f4f808c4f549c91490009',
                'k_bad15': 'b0d273634129ff4dbdf0df317d4062a1dbc58818f88878ffdb4ec511c77976c0'
            }
            ];

            var result_txt = '\n----------------------\nResults\n----------------------\n\n';

            for (i = 0; i < test_vectors.length; i++) {
                var hash = Crypto.SHA256(test_vectors[i]['message'].split('').map(function (c) {
                    return c.charCodeAt(0);
                }), {
                    asBytes: true
                });
                var wif = coinjs.privkey2wif(test_vectors[i]['privkey']);

                var KBigInt = tx.deterministicK(wif, hash);
                var KBigInt0 = tx.deterministicK(wif, hash, 0);
                var KBigInt1 = tx.deterministicK(wif, hash, 1);
                var KBigInt15 = tx.deterministicK(wif, hash, 15);

                var K = Crypto.util.bytesToHex(KBigInt.toByteArrayUnsigned());
                var K0 = Crypto.util.bytesToHex(KBigInt0.toByteArrayUnsigned());
                var K1 = Crypto.util.bytesToHex(KBigInt1.toByteArrayUnsigned());
                var K15 = Crypto.util.bytesToHex(KBigInt15.toByteArrayUnsigned());

                if (K != test_vectors[i]['k_bad00']) {
                    result_txt += 'Failed Test #' + (i + 1) + '\n       K = ' + K + '\nExpected = ' + test_vectors[i]['k_bad00'] + '\n\n';
                } else if (K0 != test_vectors[i]['k_bad00']) {
                    result_txt += 'Failed Test #' + (i + 1) + '\n      K0 = ' + K0 + '\nExpected = ' + test_vectors[i]['k_bad00'] + '\n\n';
                } else if (K1 != test_vectors[i]['k_bad01']) {
                    result_txt += 'Failed Test #' + (i + 1) + '\n      K1 = ' + K1 + '\nExpected = ' + test_vectors[i]['k_bad01'] + '\n\n';
                } else if (K15 != test_vectors[i]['k_bad15']) {
                    result_txt += 'Failed Test #' + (i + 1) + '\n     K15 = ' + K15 + '\nExpected = ' + test_vectors[i]['k_bad15'] + '\n\n';
                };
            };

            if (result_txt.length < 60) {
                result_txt = 'All Tests OK!';
            };

            return result_txt;
        };

        /* start of hd functions, thanks bip32.org */
        coinjs.hd = function (data) {

            var r = {};

            /* some hd value parsing */
            r.parse = function () {

                var bytes = [];

                // some quick validation
                if (typeof (data) == 'string') {
                    var decoded = coinjs.base58decode(data);
                    if (decoded.length == 82) {
                        var checksum = decoded.slice(78, 82);
                        var hash = Crypto.SHA256(Crypto.SHA256(decoded.slice(0, 78), {
                            asBytes: true
                        }), {
                            asBytes: true
                        });
                        if (checksum[0] == hash[0] && checksum[1] == hash[1] && checksum[2] == hash[2] && checksum[3] == hash[3]) {
                            bytes = decoded.slice(0, 78);
                        }
                    }
                }

                // actual parsing code
                if (bytes && bytes.length > 0) {
                    r.version = coinjs.uint(bytes.slice(0, 4), 4);
                    r.depth = coinjs.uint(bytes.slice(4, 5), 1);
                    r.parent_fingerprint = bytes.slice(5, 9);
                    r.child_index = coinjs.uint(bytes.slice(9, 13), 4);
                    r.chain_code = bytes.slice(13, 45);
                    r.key_bytes = bytes.slice(45, 78);

                    var c = coinjs.compressed; // get current default
                    coinjs.compressed = true;

                    if (r.key_bytes[0] == 0x00) {
                        r.type = 'private';
                        var privkey = (r.key_bytes).slice(1, 33);
                        var privkeyHex = Crypto.util.bytesToHex(privkey);
                        var pubkey = coinjs.newPubkey(privkeyHex);

                        r.keys = {
                            'privkey': privkeyHex,
                            'pubkey': pubkey,
                            'address': coinjs.pubkey2address(pubkey),
                            'wif': coinjs.privkey2wif(privkeyHex)
                        };

                    } else if (r.key_bytes[0] == 0x02 || r.key_bytes[0] == 0x03) {
                        r.type = 'public';
                        var pubkeyHex = Crypto.util.bytesToHex(r.key_bytes);

                        r.keys = {
                            'pubkey': pubkeyHex,
                            'address': coinjs.pubkey2address(pubkeyHex)
                        };
                    } else {
                        r.type = 'invalid';
                    }

                    r.keys_extended = r.extend();

                    coinjs.compressed = c; // reset to default
                }

                return r;
            }

            // extend prv/pub key
            r.extend = function () {
                var hd = coinjs.hd();
                return hd.make({
                    'depth': (this.depth * 1) + 1,
                    'parent_fingerprint': this.parent_fingerprint,
                    'child_index': this.child_index,
                    'chain_code': this.chain_code,
                    'privkey': this.keys.privkey,
                    'pubkey': this.keys.pubkey
                });
            }

            // derive from path
            r.derive_path = function (path) {

                if (path == 'm' || path == 'M' || path == 'm\'' || path == 'M\'') return this;

                var p = path.split('/');
                var hdp = coinjs.clone(this); // clone hd path

                for (var i in p) {

                    if (((i == 0) && c != 'm') || i == 'remove') {
                        continue;
                    }

                    var c = p[i];

                    var use_private = (c.length > 1) && (c[c.length - 1] == '\'');
                    var child_index = parseInt(use_private ? c.slice(0, c.length - 1) : c) & 0x7fffffff;
                    if (use_private)
                        child_index += 0x80000000;

                    hdp = hdp.derive(child_index);
                    var key = ((hdp.keys_extended.privkey) && hdp.keys_extended.privkey != '') ? hdp.keys_extended.privkey : hdp.keys_extended.pubkey;
                    hdp = coinjs.hd(key);
                }
                return hdp;
            }

            // derive key from index
            r.derive = function (i) {

                i = (i) ? i : 0;
                var blob = (Crypto.util.hexToBytes(this.keys.pubkey)).concat(coinjs.numToBytes(i, 4).reverse());

                var j = new jsSHA(Crypto.util.bytesToHex(blob), 'HEX');
                var hash = j.getHMAC(Crypto.util.bytesToHex(r.chain_code), "HEX", "SHA-512", "HEX");

                var il = new BigInteger(hash.slice(0, 64), 16);
                var ir = Crypto.util.hexToBytes(hash.slice(64, 128));

                var ecparams = EllipticCurve.getSECCurveByName("secp256k1");
                var curve = ecparams.getCurve();

                var k, key, pubkey, o;

                o = coinjs.clone(this);
                o.chain_code = ir;
                o.child_index = i;

                if (this.type == 'private') {
                    // derive key pair from from a xprv key
                    k = il.add(new BigInteger([0].concat(Crypto.util.hexToBytes(this.keys.privkey)))).mod(ecparams.getN());
                    key = Crypto.util.bytesToHex(k.toByteArrayUnsigned());

                    pubkey = coinjs.newPubkey(key);

                    o.keys = {
                        'privkey': key,
                        'pubkey': pubkey,
                        'wif': coinjs.privkey2wif(key),
                        'address': coinjs.pubkey2address(pubkey)
                    };

                } else if (this.type == 'public') {
                    // derive xpub key from an xpub key
                    q = ecparams.curve.decodePointHex(this.keys.pubkey);
                    var curvePt = ecparams.getG().multiply(il).add(q);

                    var x = curvePt.getX().toBigInteger();
                    var y = curvePt.getY().toBigInteger();

                    var publicKeyBytesCompressed = EllipticCurve.integerToBytes(x, 32)
                    if (y.isEven()) {
                        publicKeyBytesCompressed.unshift(0x02)
                    } else {
                        publicKeyBytesCompressed.unshift(0x03)
                    }
                    pubkey = Crypto.util.bytesToHex(publicKeyBytesCompressed);

                    o.keys = {
                        'pubkey': pubkey,
                        'address': coinjs.pubkey2address(pubkey)
                    }
                } else {
                    // fail
                }

                o.parent_fingerprint = (ripemd160(Crypto.SHA256(Crypto.util.hexToBytes(r.keys.pubkey), {
                    asBytes: true
                }), {
                    asBytes: true
                })).slice(0, 4);
                o.keys_extended = o.extend();
                return o;
            }

            // make a master hd xprv/xpub
            r.master = function (pass) {
                var seed = (pass) ? Crypto.SHA256(pass) : coinjs.newPrivkey();
                var hasher = new jsSHA(seed, 'HEX');
                var I = hasher.getHMAC("Bitcoin seed", "TEXT", "SHA-512", "HEX");

                var privkey = Crypto.util.hexToBytes(I.slice(0, 64));
                var chain = Crypto.util.hexToBytes(I.slice(64, 128));

                var hd = coinjs.hd();
                return hd.make({
                    'depth': 0,
                    'parent_fingerprint': [0, 0, 0, 0],
                    'child_index': 0,
                    'chain_code': chain,
                    'privkey': I.slice(0, 64),
                    'pubkey': coinjs.newPubkey(I.slice(0, 64))
                });
            }

            // encode data to a base58 string
            r.make = function (data) { // { (int) depth, (array) parent_fingerprint, (int) child_index, (byte array) chain_code, (hex str) privkey, (hex str) pubkey}
                var k = [];

                //depth
                k.push(data.depth * 1);

                //parent fingerprint
                k = k.concat(data.parent_fingerprint);

                //child index
                k = k.concat((coinjs.numToBytes(data.child_index, 4)).reverse());

                //Chain code
                k = k.concat(data.chain_code);

                var o = {}; // results

                //encode xprv key
                if (data.privkey) {
                    var prv = (coinjs.numToBytes(coinjs.hdkey.prv, 4)).reverse();
                    prv = prv.concat(k);
                    prv.push(0x00);
                    prv = prv.concat(Crypto.util.hexToBytes(data.privkey));
                    var hash = Crypto.SHA256(Crypto.SHA256(prv, {
                        asBytes: true
                    }), {
                        asBytes: true
                    });
                    var checksum = hash.slice(0, 4);
                    var ret = prv.concat(checksum);
                    o.privkey = coinjs.base58encode(ret);
                }

                //encode xpub key
                if (data.pubkey) {
                    var pub = (coinjs.numToBytes(coinjs.hdkey.pub, 4)).reverse();
                    pub = pub.concat(k);
                    pub = pub.concat(Crypto.util.hexToBytes(data.pubkey));
                    var hash = Crypto.SHA256(Crypto.SHA256(pub, {
                        asBytes: true
                    }), {
                        asBytes: true
                    });
                    var checksum = hash.slice(0, 4);
                    var ret = pub.concat(checksum);
                    o.pubkey = coinjs.base58encode(ret);
                }
                return o;
            }

            return r.parse();
        }


        /* start of script functions */
        coinjs.script = function (data) {
            var r = {};

            if (!data) {
                r.buffer = [];
            } else if ("string" == typeof data) {
                r.buffer = Crypto.util.hexToBytes(data);
            } else if (coinjs.isArray(data)) {
                r.buffer = data;
            } else if (data instanceof coinjs.script) {
                r.buffer = data.buffer;
            } else {
                r.buffer = data;
            }

            /* parse buffer array */
            r.parse = function () {

                var self = this;
                r.chunks = [];
                var i = 0;

                function readChunk(n) {
                    self.chunks.push(self.buffer.slice(i, i + n));
                    i += n;
                };

                while (i < this.buffer.length) {
                    var opcode = this.buffer[i++];
                    if (opcode >= 0xF0) {
                        opcode = (opcode << 8) | this.buffer[i++];
                    }

                    var len;
                    if (opcode > 0 && opcode < 76) { //OP_PUSHDATA1
                        readChunk(opcode);
                    } else if (opcode == 76) { //OP_PUSHDATA1
                        len = this.buffer[i++];
                        readChunk(len);
                    } else if (opcode == 77) { //OP_PUSHDATA2
                        len = (this.buffer[i++] << 8) | this.buffer[i++];
                        readChunk(len);
                    } else if (opcode == 78) { //OP_PUSHDATA4
                        len = (this.buffer[i++] << 24) | (this.buffer[i++] << 16) | (this.buffer[i++] << 8) | this.buffer[i++];
                        readChunk(len);
                    } else {
                        this.chunks.push(opcode);
                    }

                    if (i < 0x00) {
                        break;
                    }
                }

                return true;
            };

            /* decode the redeemscript of a multisignature transaction */
            r.decodeRedeemScript = function (script) {
                var r = false;
                try {
                    var s = coinjs.script(Crypto.util.hexToBytes(script));
                    if ((s.chunks.length >= 3) && s.chunks[s.chunks.length - 1] == 174) { //OP_CHECKMULTISIG
                        r = {};
                        r.signaturesRequired = s.chunks[0] - 80;
                        var pubkeys = [];
                        for (var i = 1; i < s.chunks.length - 2; i++) {
                            pubkeys.push(Crypto.util.bytesToHex(s.chunks[i]));
                        }
                        r.pubkeys = pubkeys;
                        var multi = coinjs.pubkeys2MultisigAddress(pubkeys, r.signaturesRequired);
                        r.address = multi['address'];
                        r.type = 'multisig__'; // using __ for now to differentiat from the other object .type == "multisig"
                        var rs = Crypto.util.bytesToHex(s.buffer);
                        r.redeemscript = rs;

                    } else if ((s.chunks.length == 2) && (s.buffer[0] == 0 && s.buffer[1] == 20)) { // SEGWIT
                        r = {};
                        r.type = "segwit__";
                        var rs = Crypto.util.bytesToHex(s.buffer);
                        r.address = coinjs.pubkey2address(rs, coinjs.multisig);
                        r.redeemscript = rs;

                    } else if (s.chunks.length == 5 && s.chunks[1] == 177 && s.chunks[2] == 117 && s.chunks[4] == 172) {
                        // ^ <unlocktime> OP_CHECKLOCKTIMEVERIFY OP_DROP <pubkey> OP_CHECKSIG ^
                        r = {}
                        r.pubkey = Crypto.util.bytesToHex(s.chunks[3]);
                        r.checklocktimeverify = coinjs.bytesToNum(s.chunks[0].slice());
                        r.address = coinjs.simpleHodlAddress(r.pubkey, r.checklocktimeverify).address;
                        var rs = Crypto.util.bytesToHex(s.buffer);
                        r.redeemscript = rs;
                        r.type = "hodl__";
                    }
                } catch (e) {
                    // console.log(e);
                    r = false;
                }
                return r;
            }

            /* create output script to spend */
            r.spendToScript = function (address) {
                var addr = coinjs.addressDecode(address);
                var s = coinjs.script();
                if (addr.type == "bech32") {
                    s.writeOp(0);
                    s.writeBytes(Crypto.util.hexToBytes(addr.redeemscript));
                } else if (addr.version == coinjs.multisig) { // multisig address
                    s.writeOp(169); //OP_HASH160
                    s.writeBytes(addr.bytes);
                    s.writeOp(135); //OP_EQUAL
                } else { // regular address
                    s.writeOp(118); //OP_DUP
                    s.writeOp(169); //OP_HASH160
                    s.writeBytes(addr.bytes);
                    s.writeOp(136); //OP_EQUALVERIFY
                    s.writeOp(172); //OP_CHECKSIG
                }
                return s;
            }

            /* geneate a (script) pubkey hash of the address - used for when signing */
            r.pubkeyHash = function (address) {
                var addr = coinjs.addressDecode(address);
                var s = coinjs.script();
                s.writeOp(118); //OP_DUP
                s.writeOp(169); //OP_HASH160
                s.writeBytes(addr.bytes);
                s.writeOp(136); //OP_EQUALVERIFY
                s.writeOp(172); //OP_CHECKSIG
                return s;
            }

            /* write to buffer */
            r.writeOp = function (op) {
                this.buffer.push(op);
                this.chunks.push(op);
                return true;
            }

            /* write bytes to buffer */
            r.writeBytes = function (data) {
                if (data.length < 76) { //OP_PUSHDATA1
                    this.buffer.push(data.length);
                } else if (data.length <= 0xff) {
                    this.buffer.push(76); //OP_PUSHDATA1
                    this.buffer.push(data.length);
                } else if (data.length <= 0xffff) {
                    this.buffer.push(77); //OP_PUSHDATA2
                    this.buffer.push(data.length & 0xff);
                    this.buffer.push((data.length >>> 8) & 0xff);
                } else {
                    this.buffer.push(78); //OP_PUSHDATA4
                    this.buffer.push(data.length & 0xff);
                    this.buffer.push((data.length >>> 8) & 0xff);
                    this.buffer.push((data.length >>> 16) & 0xff);
                    this.buffer.push((data.length >>> 24) & 0xff);
                }
                this.buffer = this.buffer.concat(data);
                this.chunks.push(data);
                return true;
            }

            r.parse();
            return r;
        }

        /* start of transaction functions */

        /* create a new transaction object */
        coinjs.transaction = function () {

            var r = {};
            r.version = 1;
            r.lock_time = 0;
            r.ins = [];
            r.outs = [];
            r.witness = false;
            r.timestamp = null;
            r.block = null;

            /* add an input to a transaction */
            r.addinput = function (txid, index, script, sequence) {
                var o = {};
                o.outpoint = {
                    'hash': txid,
                    'index': index
                };
                o.script = coinjs.script(script || []);
                o.sequence = sequence || ((r.lock_time == 0) ? 4294967295 : 0);
                return this.ins.push(o);
            }

            /* add an output to a transaction */
            r.addoutput = function (address, value) {
                var o = {};
                o.value = new BigInteger('' + Math.round((value * 1) * 1e8), 10);
                var s = coinjs.script();
                o.script = s.spendToScript(address);

                return this.outs.push(o);
            }

            /* add two outputs for stealth addresses to a transaction */
            r.addstealth = function (stealth, value) {
                var ephemeralKeyBigInt = BigInteger.fromByteArrayUnsigned(Crypto.util.hexToBytes(coinjs.newPrivkey()));
                var curve = EllipticCurve.getSECCurveByName("secp256k1");

                var p = EllipticCurve.fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F");
                var a = BigInteger.ZERO;
                var b = EllipticCurve.fromHex("7");
                var calccurve = new EllipticCurve.CurveFp(p, a, b);

                var ephemeralPt = curve.getG().multiply(ephemeralKeyBigInt);
                var scanPt = calccurve.decodePointHex(stealth.scankey);
                var sharedPt = scanPt.multiply(ephemeralKeyBigInt);
                var stealthindexKeyBigInt = BigInteger.fromByteArrayUnsigned(Crypto.SHA256(sharedPt.getEncoded(true), {
                    asBytes: true
                }));

                var stealthindexPt = curve.getG().multiply(stealthindexKeyBigInt);
                var spendPt = calccurve.decodePointHex(stealth.spendkey);
                var addressPt = spendPt.add(stealthindexPt);

                var sendaddress = coinjs.pubkey2address(Crypto.util.bytesToHex(addressPt.getEncoded(true)));


                var OPRETBytes = [6].concat(Crypto.util.randomBytes(4)).concat(ephemeralPt.getEncoded(true)); // ephemkey data
                var q = coinjs.script();
                q.writeOp(106); // OP_RETURN
                q.writeBytes(OPRETBytes);
                v = {};
                v.value = 0;
                v.script = q;

                this.outs.push(v);

                var o = {};
                o.value = new BigInteger('' + Math.round((value * 1) * 1e8), 10);
                var s = coinjs.script();
                o.script = s.spendToScript(sendaddress);

                return this.outs.push(o);
            }

            /* add data to a transaction */
            r.adddata = function (data) {
                var r = false;
                if (((data.match(/^[a-f0-9]+$/gi)) && data.length < 160) && (data.length % 2) == 0) {
                    var s = coinjs.script();
                    s.writeOp(106); // OP_RETURN
                    s.writeBytes(Crypto.util.hexToBytes(data));
                    o = {};
                    o.value = 0;
                    o.script = s;
                    return this.outs.push(o);
                }
                return r;
            }

            /* list unspent transactions */
            r.listUnspent = function (address, callback) {
                coinjs.ajax(coinjs.host + '?uid=' + coinjs.uid + '&key=' + coinjs.key + '&setmodule=addresses&request=unspent&address=' + address + '&r=' + Math.random(), callback, "GET");
            }

            /* list transaction data */
            r.getTransaction = function (txid, callback) {
                coinjs.ajax(coinjs.host + '?uid=' + coinjs.uid + '&key=' + coinjs.key + '&setmodule=bitcoin&request=gettransaction&txid=' + txid + '&r=' + Math.random(), callback, "GET");
            }

            /* add unspent to transaction */
            r.addUnspent = function (address, callback, script, segwit, sequence) {
                var self = this;
                this.listUnspent(address, function (data) {
                    var s = coinjs.script();
                    var value = 0;
                    var total = 0;
                    var x = {};

                    if (GLOBAL.DOMParser) {
                        parser = new DOMParser();
                        xmlDoc = parser.parseFromString(data, "text/xml");
                    } else {
                        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async = false;
                        xmlDoc.loadXML(data);
                    }

                    var unspent = xmlDoc.getElementsByTagName("unspent")[0];

                    if (unspent) {
                        for (i = 1; i <= unspent.childElementCount; i++) {
                            var u = xmlDoc.getElementsByTagName("unspent_" + i)[0]
                            var txhash = (u.getElementsByTagName("tx_hash")[0].childNodes[0].nodeValue).match(/.{1,2}/g).reverse().join("") + '';
                            var n = u.getElementsByTagName("tx_output_n")[0].childNodes[0].nodeValue;
                            var scr = script || u.getElementsByTagName("script")[0].childNodes[0].nodeValue;

                            if (segwit) {
                                /* this is a small hack to include the value with the redeemscript to make the signing procedure smoother. 
                                It is not standard and removed during the signing procedure. */

                                s = coinjs.script();
                                s.writeBytes(Crypto.util.hexToBytes(script));
                                s.writeOp(0);
                                s.writeBytes(coinjs.numToBytes(u.getElementsByTagName("value")[0].childNodes[0].nodeValue * 1, 8));
                                scr = Crypto.util.bytesToHex(s.buffer);
                            }

                            var seq = sequence || false;
                            self.addinput(txhash, n, scr, seq);
                            value += u.getElementsByTagName("value")[0].childNodes[0].nodeValue * 1;
                            total++;
                        }
                    }

                    x.result = xmlDoc.getElementsByTagName("result")[0].childNodes[0].nodeValue;
                    x.unspent = unspent;
                    x.value = value;
                    x.total = total;
                    x.response = xmlDoc.getElementsByTagName("response")[0].childNodes[0].nodeValue;

                    return callback(x);
                });
            }

            /* add unspent and sign */
            r.addUnspentAndSign = function (wif, callback) {
                var self = this;
                var address = coinjs.wif2address(wif);
                self.addUnspent(address['address'], function (data) {
                    self.sign(wif);
                    return callback(data);
                });
            }

            /* broadcast a transaction */
            r.broadcast = function (callback, txhex) {
                var tx = txhex || this.serialize();
                coinjs.ajax(coinjs.host + '?uid=' + coinjs.uid + '&key=' + coinjs.key + '&setmodule=bitcoin&request=sendrawtransaction', callback, "POST", ["rawtx=" + tx]);
            }

            /* generate the transaction hash to sign from a transaction input */
            r.transactionHash = function (index, sigHashType) {

                var clone = coinjs.clone(this);
                var shType = sigHashType || 1;

                /* black out all other ins, except this one */
                for (var i = 0; i < clone.ins.length; i++) {
                    if (index != i) {
                        clone.ins[i].script = coinjs.script();
                    }
                }

                var extract = this.extractScriptKey(index);
                clone.ins[index].script = coinjs.script(extract['script']);

                if ((clone.ins) && clone.ins[index]) {

                    /* SIGHASH : For more info on sig hashs see https://en.bitcoin.it/wiki/OP_CHECKSIG
                        and https://bitcoin.org/en/developer-guide#signature-hash-type */

                    if (shType == 1) {
                        //SIGHASH_ALL 0x01

                    } else if (shType == 2) {
                        //SIGHASH_NONE 0x02
                        clone.outs = [];
                        for (var i = 0; i < clone.ins.length; i++) {
                            if (index != i) {
                                clone.ins[i].sequence = 0;
                            }
                        }

                    } else if (shType == 3) {

                        //SIGHASH_SINGLE 0x03
                        clone.outs.length = index + 1;

                        for (var i = 0; i < index; i++) {
                            clone.outs[i].value = -1;
                            clone.outs[i].script.buffer = [];
                        }

                        for (var i = 0; i < clone.ins.length; i++) {
                            if (index != i) {
                                clone.ins[i].sequence = 0;
                            }
                        }

                    } else if (shType >= 128) {
                        //SIGHASH_ANYONECANPAY 0x80
                        clone.ins = [clone.ins[index]];

                        if (shType == 129) {
                            // SIGHASH_ALL + SIGHASH_ANYONECANPAY

                        } else if (shType == 130) {
                            // SIGHASH_NONE + SIGHASH_ANYONECANPAY
                            clone.outs = [];

                        } else if (shType == 131) {
                            // SIGHASH_SINGLE + SIGHASH_ANYONECANPAY
                            clone.outs.length = index + 1;
                            for (var i = 0; i < index; i++) {
                                clone.outs[i].value = -1;
                                clone.outs[i].script.buffer = [];
                            }
                        }
                    }

                    var buffer = Crypto.util.hexToBytes(clone.serialize());
                    buffer = buffer.concat(coinjs.numToBytes(parseInt(shType), 4));
                    var hash = Crypto.SHA256(buffer, {
                        asBytes: true
                    });
                    var r = Crypto.util.bytesToHex(Crypto.SHA256(hash, {
                        asBytes: true
                    }));
                    return r;
                } else {
                    return false;
                }
            }

            /* generate a segwit transaction hash to sign from a transaction input */
            r.transactionHashSegWitV0 = function (index, sigHashType) {
                /* 
                   Notice: coinb.in by default, deals with segwit transactions in a non-standard way.
                   Segwit transactions require that input values are included in the transaction hash.
                   To save wasting resources and potentially slowing down this service, we include the amount with the 
                   redeem script to generate the transaction hash and remove it after its signed.
                */

                // start redeem script check
                var extract = this.extractScriptKey(index);
                if (extract['type'] != 'segwit') {
                    return {
                        'result': 0,
                        'fail': 'redeemscript',
                        'response': 'redeemscript missing or not valid for segwit'
                    };
                }

                if (extract['value'] == -1) {
                    return {
                        'result': 0,
                        'fail': 'value',
                        'response': 'unable to generate a valid segwit hash without a value'
                    };
                }

                var scriptcode = Crypto.util.hexToBytes(extract['script']);

                // end of redeem script check

                /* P2WPKH */
                if (scriptcode.length == 20) {
                    scriptcode = [0x00, 0x14].concat(scriptcode);
                }

                if (scriptcode.length == 22) {
                    scriptcode = scriptcode.slice(1);
                    scriptcode.unshift(25, 118, 169);
                    scriptcode.push(136, 172);
                }

                var value = coinjs.numToBytes(extract['value'], 8);

                // start

                var zero = coinjs.numToBytes(0, 32);
                var version = coinjs.numToBytes(parseInt(this.version), 4);

                var bufferTmp = [];
                if (!(sigHashType >= 80)) { // not sighash anyonecanpay 
                    for (var i = 0; i < this.ins.length; i++) {
                        bufferTmp = bufferTmp.concat(Crypto.util.hexToBytes(this.ins[i].outpoint.hash).reverse());
                        bufferTmp = bufferTmp.concat(coinjs.numToBytes(this.ins[i].outpoint.index, 4));
                    }
                }
                var hashPrevouts = bufferTmp.length >= 1 ? Crypto.SHA256(Crypto.SHA256(bufferTmp, {
                    asBytes: true
                }), {
                    asBytes: true
                }) : zero;

                var bufferTmp = [];
                if (!(sigHashType >= 80) && sigHashType != 2 && sigHashType != 3) { // not sighash anyonecanpay & single & none
                    for (var i = 0; i < this.ins.length; i++) {
                        bufferTmp = bufferTmp.concat(coinjs.numToBytes(this.ins[i].sequence, 4));
                    }
                }
                var hashSequence = bufferTmp.length >= 1 ? Crypto.SHA256(Crypto.SHA256(bufferTmp, {
                    asBytes: true
                }), {
                    asBytes: true
                }) : zero;

                var outpoint = Crypto.util.hexToBytes(this.ins[index].outpoint.hash).reverse();
                outpoint = outpoint.concat(coinjs.numToBytes(this.ins[index].outpoint.index, 4));

                var nsequence = coinjs.numToBytes(this.ins[index].sequence, 4);
                var hashOutputs = zero;
                var bufferTmp = [];
                if (sigHashType != 2 && sigHashType != 3) { // not sighash single & none
                    for (var i = 0; i < this.outs.length; i++) {
                        bufferTmp = bufferTmp.concat(coinjs.numToBytes(this.outs[i].value, 8));
                        bufferTmp = bufferTmp.concat(coinjs.numToVarInt(this.outs[i].script.buffer.length));
                        bufferTmp = bufferTmp.concat(this.outs[i].script.buffer);
                    }
                    hashOutputs = Crypto.SHA256(Crypto.SHA256(bufferTmp, {
                        asBytes: true
                    }), {
                        asBytes: true
                    });

                } else if ((sigHashType == 2) && index < this.outs.length) { // is sighash single
                    bufferTmp = bufferTmp.concat(coinjs.numToBytes(this.outs[index].value, 8));
                    bufferTmp = bufferTmp.concat(coinjs.numToVarInt(this.outs[i].script.buffer.length));
                    bufferTmp = bufferTmp.concat(this.outs[index].script.buffer);
                    hashOutputs = Crypto.SHA256(Crypto.SHA256(bufferTmp, {
                        asBytes: true
                    }), {
                        asBytes: true
                    });
                }

                var locktime = coinjs.numToBytes(this.lock_time, 4);
                var sighash = coinjs.numToBytes(sigHashType, 4);

                var buffer = [];
                buffer = buffer.concat(version);
                buffer = buffer.concat(hashPrevouts);
                buffer = buffer.concat(hashSequence);
                buffer = buffer.concat(outpoint);
                buffer = buffer.concat(scriptcode);
                buffer = buffer.concat(value);
                buffer = buffer.concat(nsequence);
                buffer = buffer.concat(hashOutputs);
                buffer = buffer.concat(locktime);
                buffer = buffer.concat(sighash);

                var hash = Crypto.SHA256(buffer, {
                    asBytes: true
                });
                return {
                    'result': 1,
                    'hash': Crypto.util.bytesToHex(Crypto.SHA256(hash, {
                        asBytes: true
                    })),
                    'response': 'hash generated'
                };
            }

            /* extract the scriptSig, used in the transactionHash() function */
            r.extractScriptKey = function (index) {
                if (this.ins[index]) {
                    if ((this.ins[index].script.chunks.length == 5) && this.ins[index].script.chunks[4] == 172 && coinjs.isArray(this.ins[index].script.chunks[2])) { //OP_CHECKSIG
                        // regular scriptPubkey (not signed)
                        return {
                            'type': 'scriptpubkey',
                            'signed': 'false',
                            'signatures': 0,
                            'script': Crypto.util.bytesToHex(this.ins[index].script.buffer)
                        };
                    } else if ((this.ins[index].script.chunks.length == 2) && this.ins[index].script.chunks[0][0] == 48 && this.ins[index].script.chunks[1].length == 5 && this.ins[index].script.chunks[1][1] == 177) { //OP_CHECKLOCKTIMEVERIFY
                        // hodl script (signed)
                        return {
                            'type': 'hodl',
                            'signed': 'true',
                            'signatures': 1,
                            'script': Crypto.util.bytesToHex(this.ins[index].script.buffer)
                        };
                    } else if ((this.ins[index].script.chunks.length == 2) && this.ins[index].script.chunks[0][0] == 48) {
                        // regular scriptPubkey (probably signed)
                        return {
                            'type': 'scriptpubkey',
                            'signed': 'true',
                            'signatures': 1,
                            'script': Crypto.util.bytesToHex(this.ins[index].script.buffer)
                        };
                    } else if (this.ins[index].script.chunks.length == 5 && this.ins[index].script.chunks[1] == 177) { //OP_CHECKLOCKTIMEVERIFY
                        // hodl script (not signed)
                        return {
                            'type': 'hodl',
                            'signed': 'false',
                            'signatures': 0,
                            'script': Crypto.util.bytesToHex(this.ins[index].script.buffer)
                        };
                    } else if ((this.ins[index].script.chunks.length <= 3 && this.ins[index].script.chunks.length > 0) && ((this.ins[index].script.chunks[0].length == 22 && this.ins[index].script.chunks[0][0] == 0) || (this.ins[index].script.chunks[0].length == 20 && this.ins[index].script.chunks[1] == 0))) {
                        var signed = ((this.witness[index]) && this.witness[index].length == 2) ? 'true' : 'false';
                        var sigs = (signed == 'true') ? 1 : 0;
                        var value = -1; // no value found
                        if ((this.ins[index].script.chunks[2]) && this.ins[index].script.chunks[2].length == 8) {
                            value = coinjs.bytesToNum(this.ins[index].script.chunks[2]); // value found encoded in transaction (THIS IS NON STANDARD)
                        }
                        return {
                            'type': 'segwit',
                            'signed': signed,
                            'signatures': sigs,
                            'script': Crypto.util.bytesToHex(this.ins[index].script.chunks[0]),
                            'value': value
                        };
                    } else if (this.ins[index].script.chunks[0] == 0 && this.ins[index].script.chunks[this.ins[index].script.chunks.length - 1][this.ins[index].script.chunks[this.ins[index].script.chunks.length - 1].length - 1] == 174) { // OP_CHECKMULTISIG
                        // multisig script, with signature(s) included
                        var sigcount = 0;
                        for (i = 1; i < this.ins[index].script.chunks.length - 1; i++) {
                            if (this.ins[index].script.chunks[i] != 0) {
                                sigcount++;
                            }
                        }

                        return {
                            'type': 'multisig',
                            'signed': 'true',
                            'signatures': sigcount,
                            'script': Crypto.util.bytesToHex(this.ins[index].script.chunks[this.ins[index].script.chunks.length - 1])
                        };
                    } else if (this.ins[index].script.chunks[0] >= 80 && this.ins[index].script.chunks[this.ins[index].script.chunks.length - 1] == 174) { // OP_CHECKMULTISIG
                        // multisig script, without signature!
                        return {
                            'type': 'multisig',
                            'signed': 'false',
                            'signatures': 0,
                            'script': Crypto.util.bytesToHex(this.ins[index].script.buffer)
                        };
                    } else if (this.ins[index].script.chunks.length == 0) {
                        // empty
                        //bech32 witness check
                        var signed = ((this.witness[index]) && this.witness[index].length == 2) ? 'true' : 'false';
                        var sigs = (signed == 'true') ? 1 : 0;
                        return {
                            'type': 'empty',
                            'signed': signed,
                            'signatures': sigs,
                            'script': ''
                        };
                    } else {
                        // something else
                        return {
                            'type': 'unknown',
                            'signed': 'false',
                            'signatures': 0,
                            'script': Crypto.util.bytesToHex(this.ins[index].script.buffer)
                        };
                    }
                } else {
                    return false;
                }
            }

            /* generate a signature from a transaction hash */
            r.transactionSig = function (index, wif, sigHashType, txhash) {

                function serializeSig(r, s) {
                    var rBa = r.toByteArraySigned();
                    var sBa = s.toByteArraySigned();

                    var sequence = [];
                    sequence.push(0x02); // INTEGER
                    sequence.push(rBa.length);
                    sequence = sequence.concat(rBa);

                    sequence.push(0x02); // INTEGER
                    sequence.push(sBa.length);
                    sequence = sequence.concat(sBa);

                    sequence.unshift(sequence.length);
                    sequence.unshift(0x30); // SEQUENCE

                    return sequence;
                }

                var shType = sigHashType || 1;
                var hash = txhash || Crypto.util.hexToBytes(this.transactionHash(index, shType));

                if (hash) {
                    var curve = EllipticCurve.getSECCurveByName("secp256k1");
                    var key = coinjs.wif2privkey(wif);
                    var priv = BigInteger.fromByteArrayUnsigned(Crypto.util.hexToBytes(key['privkey']));
                    var n = curve.getN();
                    var e = BigInteger.fromByteArrayUnsigned(hash);
                    var badrs = 0
                    do {
                        var k = this.deterministicK(wif, hash, badrs);
                        var G = curve.getG();
                        var Q = G.multiply(k);
                        var r = Q.getX().toBigInteger().mod(n);
                        var s = k.modInverse(n).multiply(e.add(priv.multiply(r))).mod(n);
                        badrs++
                    } while (r.compareTo(BigInteger.ZERO) <= 0 || s.compareTo(BigInteger.ZERO) <= 0);

                    // Force lower s values per BIP62
                    var halfn = n.shiftRight(1);
                    if (s.compareTo(halfn) > 0) {
                        s = n.subtract(s);
                    };

                    var sig = serializeSig(r, s);
                    sig.push(parseInt(shType, 10));

                    return Crypto.util.bytesToHex(sig);
                } else {
                    return false;
                }
            }

            // https://tools.ietf.org/html/rfc6979#section-3.2
            r.deterministicK = function (wif, hash, badrs) {
                // if r or s were invalid when this function was used in signing,
                // we do not want to actually compute r, s here for efficiency, so,
                // we can increment badrs. explained at end of RFC 6979 section 3.2

                // wif is b58check encoded wif privkey.
                // hash is byte array of transaction digest.
                // badrs is used only if the k resulted in bad r or s.

                // some necessary things out of the way for clarity.
                badrs = badrs || 0;
                var key = coinjs.wif2privkey(wif);
                var x = Crypto.util.hexToBytes(key['privkey'])
                var curve = EllipticCurve.getSECCurveByName("secp256k1");
                var N = curve.getN();

                // Step: a
                // hash is a byteArray of the message digest. so h1 == hash in our case

                // Step: b
                var v = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

                // Step: c
                var k = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                // Step: d
                k = Crypto.HMAC(Crypto.SHA256, v.concat([0]).concat(x).concat(hash), k, {
                    asBytes: true
                });

                // Step: e
                v = Crypto.HMAC(Crypto.SHA256, v, k, {
                    asBytes: true
                });

                // Step: f
                k = Crypto.HMAC(Crypto.SHA256, v.concat([1]).concat(x).concat(hash), k, {
                    asBytes: true
                });

                // Step: g
                v = Crypto.HMAC(Crypto.SHA256, v, k, {
                    asBytes: true
                });

                // Step: h1
                var T = [];

                // Step: h2 (since we know tlen = qlen, just copy v to T.)
                v = Crypto.HMAC(Crypto.SHA256, v, k, {
                    asBytes: true
                });
                T = v;

                // Step: h3
                var KBigInt = BigInteger.fromByteArrayUnsigned(T);

                // loop if KBigInt is not in the range of [1, N-1] or if badrs needs incrementing.
                var i = 0
                while (KBigInt.compareTo(N) >= 0 || KBigInt.compareTo(BigInteger.ZERO) <= 0 || i < badrs) {
                    k = Crypto.HMAC(Crypto.SHA256, v.concat([0]), k, {
                        asBytes: true
                    });
                    v = Crypto.HMAC(Crypto.SHA256, v, k, {
                        asBytes: true
                    });
                    v = Crypto.HMAC(Crypto.SHA256, v, k, {
                        asBytes: true
                    });
                    T = v;
                    KBigInt = BigInteger.fromByteArrayUnsigned(T);
                    i++
                };

                return KBigInt;
            };

            /* sign a "standard" input */
            r.signinput = function (index, wif, sigHashType) {
                var key = coinjs.wif2pubkey(wif);
                var shType = sigHashType || 1;
                var signature = this.transactionSig(index, wif, shType);
                var s = coinjs.script();
                s.writeBytes(Crypto.util.hexToBytes(signature));
                s.writeBytes(Crypto.util.hexToBytes(key['pubkey']));
                this.ins[index].script = s;
                return true;
            }

            /* signs a time locked / hodl input */
            r.signhodl = function (index, wif, sigHashType) {
                var shType = sigHashType || 1;
                var signature = this.transactionSig(index, wif, shType);
                var redeemScript = this.ins[index].script.buffer
                var s = coinjs.script();
                s.writeBytes(Crypto.util.hexToBytes(signature));
                s.writeBytes(redeemScript);
                this.ins[index].script = s;
                return true;
            }

            /* sign a multisig input */
            r.signmultisig = function (index, wif, sigHashType) {

                function scriptListPubkey(redeemScript) {
                    var r = {};
                    for (var i = 1; i < redeemScript.chunks.length - 2; i++) {
                        r[i] = Crypto.util.hexToBytes(coinjs.pubkeydecompress(Crypto.util.bytesToHex(redeemScript.chunks[i])));
                    }
                    return r;
                }

                function scriptListSigs(scriptSig) {
                    var r = {};
                    var c = 0;
                    if (scriptSig.chunks[0] == 0 && scriptSig.chunks[scriptSig.chunks.length - 1][scriptSig.chunks[scriptSig.chunks.length - 1].length - 1] == 174) {
                        for (var i = 1; i < scriptSig.chunks.length - 1; i++) {
                            if (scriptSig.chunks[i] != 0) {
                                c++;
                                r[c] = scriptSig.chunks[i];
                            }
                        }
                    }
                    return r;
                }

                var redeemScript = (this.ins[index].script.chunks[this.ins[index].script.chunks.length - 1] == 174) ? this.ins[index].script.buffer : this.ins[index].script.chunks[this.ins[index].script.chunks.length - 1];

                var pubkeyList = scriptListPubkey(coinjs.script(redeemScript));
                var sigsList = scriptListSigs(this.ins[index].script);

                var shType = sigHashType || 1;
                var sighash = Crypto.util.hexToBytes(this.transactionHash(index, shType));
                var signature = Crypto.util.hexToBytes(this.transactionSig(index, wif, shType));

                sigsList[coinjs.countObject(sigsList) + 1] = signature;

                var s = coinjs.script();

                s.writeOp(0);

                for (x in pubkeyList) {
                    for (y in sigsList) {
                        this.ins[index].script.buffer = redeemScript;
                        sighash = Crypto.util.hexToBytes(this.transactionHash(index, sigsList[y].slice(-1)[0] * 1));
                        if (coinjs.verifySignature(sighash, sigsList[y], pubkeyList[x])) {
                            s.writeBytes(sigsList[y]);
                        }
                    }
                }

                s.writeBytes(redeemScript);
                this.ins[index].script = s;
                return true;
            }

            /* sign segwit input */
            r.signsegwit = function (index, wif, sigHashType) {
                var shType = sigHashType || 1;

                var wif2 = coinjs.wif2pubkey(wif);
                var segwit = coinjs.segwitAddress(wif2['pubkey']);
                var bech32 = coinjs.bech32Address(wif2['pubkey']);

                if ((segwit['redeemscript'] == Crypto.util.bytesToHex(this.ins[index].script.chunks[0])) || (bech32['redeemscript'] == Crypto.util.bytesToHex(this.ins[index].script.chunks[0]))) {
                    var txhash = this.transactionHashSegWitV0(index, shType);

                    if (txhash.result == 1) {

                        var segwitHash = Crypto.util.hexToBytes(txhash.hash);
                        var signature = this.transactionSig(index, wif, shType, segwitHash);

                        // remove any non standard data we store, i.e. input value
                        var script = coinjs.script();
                        script.writeBytes(this.ins[index].script.chunks[0]);
                        this.ins[index].script = script;

                        if (!coinjs.isArray(this.witness)) {
                            this.witness = new Array(this.ins.length);
                            this.witness.fill([]);
                        }

                        this.witness[index] = ([signature, wif2['pubkey']]);

                        // bech32, empty redeemscript
                        if (bech32['redeemscript'] == Crypto.util.bytesToHex(this.ins[index].script.chunks[0])) {
                            this.ins[index].script = coinjs.script();
                        }

                        /* attempt to reorder witness data as best as we can. 
                           data can't be easily validated at this stage as 
                           we dont have access to the inputs value and 
                           making a web call will be too slow. */

                        /*
                        var witness_order = [];
                        var witness_used = [];
                        for (var i = 0; i < this.ins.length; i++) {
                            for (var y = 0; y < this.witness.length; y++) {
                                if (!witness_used.includes(y)) {
                                    var sw = coinjs.segwitAddress(this.witness[y][1]);
                                    var b32 = coinjs.bech32Address(this.witness[y][1]);
                                    var rs = '';

                                    if (this.ins[i].script.chunks.length >= 1) {
                                        rs = Crypto.util.bytesToHex(this.ins[i].script.chunks[0]);
                                    } else if (this.ins[i].script.chunks.length == 0) {
                                        rs = b32['redeemscript'];
                                    }

                                    if ((sw['redeemscript'] == rs) || (b32['redeemscript'] == rs)) {
                                        witness_order.push(this.witness[y]);
                                        witness_used.push(y);

                                        // bech32, empty redeemscript
                                        if (b32['redeemscript'] == rs) {
                                            this.ins[index].script = coinjs.script();
                                        }
                                        break;
                                    }
                                }
                            }
                        }

                        this.witness = witness_order;
                        */
                    }
                }
                return true;
            }

            /* sign inputs */
            r.sign = function (wif, sigHashType) {
                var shType = sigHashType || 1;
                for (var i = 0; i < this.ins.length; i++) {
                    var d = this.extractScriptKey(i);

                    var w2a = coinjs.wif2address(wif);
                    var script = coinjs.script();
                    var pubkeyHash = script.pubkeyHash(w2a['address']);

                    if (((d['type'] == 'scriptpubkey' && d['script'] == Crypto.util.bytesToHex(pubkeyHash.buffer)) || d['type'] == 'empty') && d['signed'] == "false") {
                        this.signinput(i, wif, shType);

                    } else if (d['type'] == 'hodl' && d['signed'] == "false") {
                        this.signhodl(i, wif, shType);

                    } else if (d['type'] == 'multisig') {
                        this.signmultisig(i, wif, shType);

                    } else if (d['type'] == 'segwit') {
                        this.signsegwit(i, wif, shType);

                    } else {
                        // could not sign
                    }
                }
                return this.serialize();
            }

            /* serialize a transaction */
            r.serialize = function () {
                var buffer = [];
                buffer = buffer.concat(coinjs.numToBytes(parseInt(this.version), 4));

                if (coinjs.isArray(this.witness)) {
                    buffer = buffer.concat([0x00, 0x01]);
                }

                buffer = buffer.concat(coinjs.numToVarInt(this.ins.length));
                for (var i = 0; i < this.ins.length; i++) {
                    var txin = this.ins[i];
                    buffer = buffer.concat(Crypto.util.hexToBytes(txin.outpoint.hash).reverse());
                    buffer = buffer.concat(coinjs.numToBytes(parseInt(txin.outpoint.index), 4));
                    var scriptBytes = txin.script.buffer;
                    buffer = buffer.concat(coinjs.numToVarInt(scriptBytes.length));
                    buffer = buffer.concat(scriptBytes);
                    buffer = buffer.concat(coinjs.numToBytes(parseInt(txin.sequence), 4));
                }
                buffer = buffer.concat(coinjs.numToVarInt(this.outs.length));

                for (var i = 0; i < this.outs.length; i++) {
                    var txout = this.outs[i];
                    buffer = buffer.concat(coinjs.numToBytes(txout.value, 8));
                    var scriptBytes = txout.script.buffer;
                    buffer = buffer.concat(coinjs.numToVarInt(scriptBytes.length));
                    buffer = buffer.concat(scriptBytes);
                }

                if ((coinjs.isArray(this.witness)) && this.witness.length >= 1) {
                    for (var i = 0; i < this.witness.length; i++) {
                        buffer = buffer.concat(coinjs.numToVarInt(this.witness[i].length));
                        for (var x = 0; x < this.witness[i].length; x++) {
                            buffer = buffer.concat(coinjs.numToVarInt(Crypto.util.hexToBytes(this.witness[i][x]).length));
                            buffer = buffer.concat(Crypto.util.hexToBytes(this.witness[i][x]));
                        }
                    }
                }

                buffer = buffer.concat(coinjs.numToBytes(parseInt(this.lock_time), 4));
                return Crypto.util.bytesToHex(buffer);
            }

            /* deserialize a transaction */
            r.deserialize = function (buffer) {
                if (typeof buffer == "string") {
                    buffer = Crypto.util.hexToBytes(buffer)
                }

                var pos = 0;
                var witness = false;

                var readAsInt = function (bytes) {
                    if (bytes == 0) return 0;
                    pos++;
                    return buffer[pos - 1] + readAsInt(bytes - 1) * 256;
                }

                var readVarInt = function () {
                    pos++;
                    if (buffer[pos - 1] < 253) {
                        return buffer[pos - 1];
                    }
                    return readAsInt(buffer[pos - 1] - 251);
                }

                var readBytes = function (bytes) {
                    pos += bytes;
                    return buffer.slice(pos - bytes, pos);
                }

                var readVarString = function () {
                    var size = readVarInt();
                    return readBytes(size);
                }

                var obj = new coinjs.transaction();
                obj.version = readAsInt(4);

                if (buffer[pos] == 0x00 && buffer[pos + 1] == 0x01) {
                    // segwit transaction
                    witness = true;
                    obj.witness = [];
                    pos += 2;
                }

                var ins = readVarInt();
                for (var i = 0; i < ins; i++) {
                    obj.ins.push({
                        outpoint: {
                            hash: Crypto.util.bytesToHex(readBytes(32).reverse()),
                            index: readAsInt(4)
                        },
                        script: coinjs.script(readVarString()),
                        sequence: readAsInt(4)
                    });
                }

                var outs = readVarInt();
                for (var i = 0; i < outs; i++) {
                    obj.outs.push({
                        value: coinjs.bytesToNum(readBytes(8)),
                        script: coinjs.script(readVarString())
                    });
                }

                if (witness == true) {
                    for (i = 0; i < ins; ++i) {
                        var count = readVarInt();
                        var vector = [];
                        if (!coinjs.isArray(obj.witness[i])) {
                            obj.witness[i] = [];
                        }
                        for (var y = 0; y < count; y++) {
                            var slice = readVarInt();
                            pos += slice;
                            obj.witness[i].push(Crypto.util.bytesToHex(buffer.slice(pos - slice, pos)));
                        }
                    }
                }

                obj.lock_time = readAsInt(4);
                return obj;
            }

            r.size = function () {
                return ((this.serialize()).length / 2).toFixed(0);
            }

            return r;
        }

        /* start of signature vertification functions */

        coinjs.verifySignature = function (hash, sig, pubkey) {

            function parseSig(sig) {
                var cursor;
                if (sig[0] != 0x30)
                    throw new Error("Signature not a valid DERSequence");

                cursor = 2;
                if (sig[cursor] != 0x02)
                    throw new Error("First element in signature must be a DERInteger");;

                var rBa = sig.slice(cursor + 2, cursor + 2 + sig[cursor + 1]);

                cursor += 2 + sig[cursor + 1];
                if (sig[cursor] != 0x02)
                    throw new Error("Second element in signature must be a DERInteger");

                var sBa = sig.slice(cursor + 2, cursor + 2 + sig[cursor + 1]);

                cursor += 2 + sig[cursor + 1];

                var r = BigInteger.fromByteArrayUnsigned(rBa);
                var s = BigInteger.fromByteArrayUnsigned(sBa);

                return {
                    r: r,
                    s: s
                };
            }

            var r, s;

            if (coinjs.isArray(sig)) {
                var obj = parseSig(sig);
                r = obj.r;
                s = obj.s;
            } else if ("object" === typeof sig && sig.r && sig.s) {
                r = sig.r;
                s = sig.s;
            } else {
                throw "Invalid value for signature";
            }

            var Q;
            if (coinjs.isArray(pubkey)) {
                var ecparams = EllipticCurve.getSECCurveByName("secp256k1");
                Q = EllipticCurve.PointFp.decodeFrom(ecparams.getCurve(), pubkey);
            } else {
                throw "Invalid format for pubkey value, must be byte array";
            }
            var e = BigInteger.fromByteArrayUnsigned(hash);

            return coinjs.verifySignatureRaw(e, r, s, Q);
        }

        coinjs.verifySignatureRaw = function (e, r, s, Q) {
            var ecparams = EllipticCurve.getSECCurveByName("secp256k1");
            var n = ecparams.getN();
            var G = ecparams.getG();

            if (r.compareTo(BigInteger.ONE) < 0 || r.compareTo(n) >= 0)
                return false;

            if (s.compareTo(BigInteger.ONE) < 0 || s.compareTo(n) >= 0)
                return false;

            var c = s.modInverse(n);

            var u1 = e.multiply(c).mod(n);
            var u2 = r.multiply(c).mod(n);

            var point = G.multiply(u1).add(Q.multiply(u2));

            var v = point.getX().toBigInteger().mod(n);

            return v.equals(r);
        }

        /* start of privates functions */

        /* base58 encode function */
        coinjs.base58encode = function (buffer) {
            var alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
            var base = BigInteger.valueOf(58);

            var bi = BigInteger.fromByteArrayUnsigned(buffer);
            var chars = [];

            while (bi.compareTo(base) >= 0) {
                var mod = bi.mod(base);
                chars.unshift(alphabet[mod.intValue()]);
                bi = bi.subtract(mod).divide(base);
            }

            chars.unshift(alphabet[bi.intValue()]);
            for (var i = 0; i < buffer.length; i++) {
                if (buffer[i] == 0x00) {
                    chars.unshift(alphabet[0]);
                } else break;
            }
            return chars.join('');
        }

        /* base58 decode function */
        coinjs.base58decode = function (buffer) {
            var alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
            var base = BigInteger.valueOf(58);
            var validRegex = /^[1-9A-HJ-NP-Za-km-z]+$/;

            var bi = BigInteger.valueOf(0);
            var leadingZerosNum = 0;
            for (var i = buffer.length - 1; i >= 0; i--) {
                var alphaIndex = alphabet.indexOf(buffer[i]);
                if (alphaIndex < 0) {
                    throw "Invalid character";
                }
                bi = bi.add(BigInteger.valueOf(alphaIndex).multiply(base.pow(buffer.length - 1 - i)));

                if (buffer[i] == "1") leadingZerosNum++;
                else leadingZerosNum = 0;
            }

            var bytes = bi.toByteArrayUnsigned();
            while (leadingZerosNum-- > 0) bytes.unshift(0);
            return bytes;
        }

        /* raw ajax function to avoid needing bigger frame works like jquery, mootools etc */
        coinjs.ajax = function (u, f, m, a) {
            var x = false;
            try {
                x = new ActiveXObject('Msxml2.XMLHTTP')
            } catch (e) {
                try {
                    x = new ActiveXObject('Microsoft.XMLHTTP')
                } catch (e) {
                    x = new XMLHttpRequest()
                }
            }

            if (x == false) {
                return false;
            }

            x.open(m, u, true);
            x.onreadystatechange = function () {
                if ((x.readyState == 4) && f)
                    f(x.responseText);
            };

            if (m == 'POST') {
                x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }

            x.send(a);
        }

        /* clone an object */
        coinjs.clone = function (obj) {
            if (obj == null || typeof (obj) != 'object') return obj;
            var temp = new obj.constructor();

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    temp[key] = coinjs.clone(obj[key]);
                }
            }
            return temp;
        }

        coinjs.numToBytes = function (num, bytes) {
            if (typeof bytes === "undefined") bytes = 8;
            if (bytes == 0) {
                return [];
            } else if (num == -1) {
                return Crypto.util.hexToBytes("ffffffffffffffff");
            } else {
                return [num % 256].concat(coinjs.numToBytes(Math.floor(num / 256), bytes - 1));
            }
        }

        function scriptNumSize(i) {
            return i > 0x7fffffff ? 5 :
                i > 0x7fffff ? 4 :
                    i > 0x7fff ? 3 :
                        i > 0x7f ? 2 :
                            i > 0x00 ? 1 :
                                0;
        }

        coinjs.numToScriptNumBytes = function (_number) {
            var value = Math.abs(_number);
            var size = scriptNumSize(value);
            var result = [];
            for (var i = 0; i < size; ++i) {
                result.push(0);
            }
            var negative = _number < 0;
            for (i = 0; i < size; ++i) {
                result[i] = value & 0xff;
                value = Math.floor(value / 256);
            }
            if (negative) {
                result[size - 1] |= 0x80;
            }
            return result;
        }

        coinjs.numToVarInt = function (num) {
            if (num < 253) {
                return [num];
            } else if (num < 65536) {
                return [253].concat(coinjs.numToBytes(num, 2));
            } else if (num < 4294967296) {
                return [254].concat(coinjs.numToBytes(num, 4));
            } else {
                return [255].concat(coinjs.numToBytes(num, 8));
            }
        }

        coinjs.bytesToNum = function (bytes) {
            if (bytes.length == 0) return 0;
            else return bytes[0] + 256 * coinjs.bytesToNum(bytes.slice(1));
        }

        coinjs.uint = function (f, size) {
            if (f.length < size)
                throw new Error("not enough data");
            var n = 0;
            for (var i = 0; i < size; i++) {
                n *= 256;
                n += f[i];
            }
            return n;
        }

        coinjs.isArray = function (o) {
            return Object.prototype.toString.call(o) === '[object Array]';
        }

        coinjs.countObject = function (obj) {
            var count = 0;
            var i;
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    count++;
                }
            }
            return count;
        }

        coinjs.random = function (length) {
            var r = "";
            var l = length || 25;
            var chars = "!$%^&*()_+{}:@~?><|\./;'#][=-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            for (x = 0; x < l; x++) {
                r += chars.charAt(Math.floor(Math.random() * 62));
            }
            return r;
        }

    })();
})(typeof global !== "undefined" ? global : window);

(function (EXPORTS) { //btc_api v1.0.6
    const btc_api = EXPORTS;

    //This library uses API provided by chain.so (https://chain.so/)
    const URL = "https://chain.so/api/v2/";

    const fetch_api = btc_api.fetch = function (api) {
        return new Promise((resolve, reject) => {
            console.debug(URL + api);
            fetch(URL + api).then(response => {
                response.json()
                    .then(result => result.status === "success" ? resolve(result) : reject(result))
                    .catch(error => reject(error))
            }).catch(error => reject(error))
        })
    };

    const broadcast = btc_api.broadcast = rawtx => new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: URL + "send_tx/BTC/",
            data: {
                "tx_hex": rawtx
            },
            dataType: "json",
            error: e => reject(e.responseJSON),
            success: r => r.status === "success" ? resolve(r.data) : reject(r)
        })
    });

    Object.defineProperties(btc_api, {
        newKeys: {
            get: () => {
                let r = coinjs.newKeys();
                r.segwitAddress = coinjs.segwitAddress(r.pubkey).address;
                r.bech32Address = coinjs.bech32Address(r.pubkey).address;
                return r;
            }
        },
        pubkey: {
            value: key => key.length >= 66 ? key : (key.length == 64 ? coinjs.newPubkey(key) : coinjs.wif2pubkey(key).pubkey)
        },
        address: {
            value: (key, prefix = undefined) => coinjs.pubkey2address(btc_api.pubkey(key), prefix)
        },
        segwitAddress: {
            value: key => coinjs.segwitAddress(btc_api.pubkey(key)).address
        },
        bech32Address: {
            value: key => coinjs.bech32Address(btc_api.pubkey(key)).address
        }
    });

    coinjs.compressed = true;

    const verifyKey = btc_api.verifyKey = function (addr, key) {
        if (!addr || !key)
            return undefined;
        switch (coinjs.addressDecode(addr).type) {
            case "standard":
                return btc_api.address(key) === addr;
            case "multisig":
                return btc_api.segwitAddress(key) === addr;
            case "bech32":
                return btc_api.bech32Address(key) === addr;
            default:
                return null;
        }
    }

    const validateAddress = btc_api.validateAddress = function (addr) {
        if (!addr)
            return undefined;
        let type = coinjs.addressDecode(addr).type;
        if (["standard", "multisig", "bech32"].includes(type))
            return type;
        else
            return false;
    }

    //convert from one blockchain to another blockchain (target version)
    btc_api.convert = {};

    btc_api.convert.wif = function (source_wif, target_version = coinjs.priv) {
        let keyHex = decodeLegacy(source_wif).hex;
        if (!keyHex || keyHex.length < 66 || !/01$/.test(keyHex))
            return null;
        else
            return encodeLegacy(keyHex, target_version);
    }

    btc_api.convert.legacy2legacy = function (source_addr, target_version = coinjs.pub) {
        let rawHex = decodeLegacy(source_addr).hex;
        if (!rawHex)
            return null;
        else
            return encodeLegacy(rawHex, target_version);
    }

    btc_api.convert.legacy2bech = function (source_addr, target_version = coinjs.bech32.version, target_hrp = coinjs.bech32.hrp) {
        let rawHex = decodeLegacy(source_addr).hex;
        if (!rawHex)
            return null;
        else
            return encodeBech32(rawHex, target_version, target_hrp);
    }

    btc_api.convert.bech2bech = function (source_addr, target_version = coinjs.bech32.version, target_hrp = coinjs.bech32.hrp) {
        let rawHex = decodeBech32(source_addr).hex;
        if (!rawHex)
            return null;
        else
            return encodeBech32(rawHex, target_version, target_hrp);
    }

    btc_api.convert.bech2legacy = function (source_addr, target_version = coinjs.pub) {
        let rawHex = decodeBech32(source_addr).hex;
        if (!rawHex)
            return null;
        else
            return encodeLegacy(rawHex, target_version);
    }

    function decodeLegacy(source) {
        var decode = coinjs.base58decode(source);
        var raw = decode.slice(0, decode.length - 4),
            checksum = decode.slice(decode.length - 4);
        var hash = Crypto.SHA256(Crypto.SHA256(raw, {
            asBytes: true
        }), {
            asBytes: true
        });
        if (hash[0] != checksum[0] || hash[1] != checksum[1] || hash[2] != checksum[2] || hash[3] != checksum[3])
            return null;
        let version = raw.shift();
        return {
            version: version,
            hex: Crypto.util.bytesToHex(raw)
        }
    }

    function encodeLegacy(hex, version) {
        var bytes = Crypto.util.hexToBytes(hex);
        bytes.unshift(version);
        var hash = Crypto.SHA256(Crypto.SHA256(bytes, {
            asBytes: true
        }), {
            asBytes: true
        });
        var checksum = hash.slice(0, 4);
        return coinjs.base58encode(bytes.concat(checksum));
    }

    function decodeBech32(source) {
        let decode = coinjs.bech32_decode(source);
        if (!decode)
            return null;
        var raw = decode.data;
        let version = raw.shift();
        raw = coinjs.bech32_convert(raw, 5, 8, false);
        return {
            hrp: decode.hrp,
            version: version,
            hex: Crypto.util.bytesToHex(raw)
        }
    }

    function encodeBech32(hex, version, hrp) {
        var bytes = Crypto.util.hexToBytes(hex);
        bytes = coinjs.bech32_convert(bytes, 8, 5, true);
        bytes.unshift(version)
        return coinjs.bech32_encode(hrp, bytes);
    }

    btc_api.getBalance = addr => new Promise((resolve, reject) => {
        fetch_api(`get_address_balance/BTC/${addr}`)
            .then(result => resolve(parseFloat(result.data.confirmed_balance)))
            .catch(error => reject(error))
    });

    function _redeemScript(addr, key) {
        let decode = coinjs.addressDecode(addr);
        switch (decode.type) {
            case "standard":
                return false;
            case "multisig":
                return coinjs.segwitAddress(btc_api.pubkey(key)).redeemscript;
            case "bech32":
                return decode.redeemscript;
            default:
                return null;
        }
    }

    function addUTXOs(tx, senders, redeemScripts, required_amount, n = 0) {
        return new Promise((resolve, reject) => {
            required_amount = parseFloat(required_amount.toFixed(8));
            if (required_amount <= 0 || n >= senders.length)
                return resolve(required_amount);
            let addr = senders[n],
                rs = redeemScripts[n];
            fetch_api(`get_tx_unspent/BTC/${addr}`).then(result => {
                let utxos = result.data.txs;
                console.debug("add-utxo", addr, rs, required_amount, utxos);
                for (let i = 0; i < utxos.length && required_amount > 0; i++) {
                    if (!utxos[i].confirmations) //ignore unconfirmed utxo
                        continue;
                    required_amount -= parseFloat(utxos[i].value);
                    var script;
                    if (rs) { //redeemScript for segwit/bech32
                        let s = coinjs.script();
                        s.writeBytes(Crypto.util.hexToBytes(rs));
                        s.writeOp(0);
                        s.writeBytes(coinjs.numToBytes((utxos[i].value * 100000000).toFixed(0), 8));
                        script = Crypto.util.bytesToHex(s.buffer);
                    } else //legacy script
                        script = utxos[i].script_hex;
                    tx.addinput(utxos[i].txid, utxos[i].output_no, script, 0xfffffffd /*sequence*/); //0xfffffffd for Replace-by-fee
                }
                addUTXOs(tx, senders, redeemScripts, required_amount, n + 1)
                    .then(result => resolve(result))
                    .catch(error => reject(error))
            }).catch(error => reject(error))
        })
    }

    btc_api.sendTx = function (senders, privkeys, receivers, amounts, fee, change_addr = null) {
        return new Promise((resolve, reject) => {
            //Add values into array (if single values are passed)
            if (!Array.isArray(senders))
                senders = [senders];
            if (!Array.isArray(privkeys))
                privkeys = [privkeys];
            if (!Array.isArray(receivers))
                receivers = [receivers];
            if (!Array.isArray(amounts))
                amounts = [amounts];

            let invalids = [];
            //validate tx-input parameters
            if (senders.length != privkeys.length)
                return reject("Array length for senders and privkeys should be equal");
            const redeemScripts = [],
                wif_keys = [];
            for (let i in senders) {
                if (!verifyKey(senders[i], privkeys[i])) //verify private-key
                    invalids.push(senders[i]);
                if (privkeys[i].length === 64) //convert Hex to WIF if needed
                    privkeys[i] = coinjs.privkey2wif(privkeys[i]);
                let rs = _redeemScript(senders[i], privkeys[i]); //get redeem-script (segwit/bech32)
                redeemScripts.push(rs);
                rs === false ? wif_keys.unshift(privkeys[i]) : wif_keys.push(privkeys[i]); //sorting private-keys (wif)
            }
            if (invalids.length)
                return reject("Invalid keys:" + invalids);
            if (typeof fee !== "number" || fee <= 0)
                return reject("Invalid fee:" + fee);

            //validate tx-output parameters
            if (receivers.length != amounts.length)
                return reject("Array length for receivers and amounts should be equal");
            let total_amount = 0;
            for (let i in receivers)
                if (!validateAddress(receivers[i]))
                    invalids.push(receivers[i]);
            if (invalids.length)
                return reject("Invalid receivers:" + invalids);
            for (let i in amounts) {
                if (typeof amounts[i] !== "number" || amounts[i] <= 0)
                    invalids.push(amounts[i]);
                else
                    total_amount += amounts[i];
            }
            if (invalids.length)
                return reject("Invalid amounts:" + invalids);
            if (change_addr && !validateAddress(change_addr))
                return reject("Invalid change_address:" + change_addr);

            //create transaction
            var tx = coinjs.transaction();
            total_amount = parseFloat(total_amount.toFixed(8));
            addUTXOs(tx, senders, redeemScripts, total_amount + fee).then(result => {
                if (result > 0)
                    return reject("Insufficient Balance");
                for (let i in receivers)
                    tx.addoutput(receivers[i], amounts[i]);
                let change = parseFloat(Math.abs(result).toFixed(8));
                if (change > 0)
                    tx.addoutput(change_addr || senders[0], change);
                console.debug("amounts (total, fee, change):", total_amount, fee, change);
                console.debug("Unsigned:", tx.serialize());
                new Set(wif_keys).forEach(key => console.debug("Signing key:", key, tx.sign(key, 1 /*sighashtype*/))); //Sign the tx using private key WIF

                console.debug("Signed:", tx.serialize());
                debugger;
                broadcast(tx.serialize())
                    .then(result => resolve(result))
                    .catch(error => reject(error));
            }).catch(error => reject(error))
        })
    };

    btc_api.getTx = txid => new Promise((resolve, reject) => {
        fetch_api(`get_tx/BTC/${txid}`)
            .then(result => resolve(result.data))
            .catch(error => reject(error))
    });

    btc_api.getAddressData = addr => new Promise((resolve, reject) => {
        fetch_api(`address/BTC/${addr}`)
            .then(result => resolve(result.data))
            .catch(error => reject(error))
    });

    btc_api.getBlock = block => new Promise((resolve, reject) => {
        fetch_api(`get_block/BTC/${block}`)
            .then(result => resolve(result.data))
            .catch(error => reject(error))
    });

})('object' === typeof module ? module.exports : window.btc_api = {});