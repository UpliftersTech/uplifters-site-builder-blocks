/**
 * Uplifters Website Builder reusable plugin page icon.
 *
 * Self-contained, DOM-based SVG factory for the brand mark. The artwork is
 * src/assets-shared/brand-icon/icon.svg, with every id scoped to the
 * instance so several icons on one page cannot resolve each other's
 * gradients or masks. ARTWORK and ANIMATION_CSS are generated from icon.svg
 * and must be regenerated together with the other brand-icon copies whenever
 * it changes.
 *
 * Exposes:
 * window.UpliftersSiteBuilderBlocksDashboardBrandIcon.createIcon()
 *
 * It can also be imported as an ES module:
 * import { createIcon } from './dashboard-brand-icon';
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/*
 * icon.svg carries its own padding (for the shine sweep), so the mark fills
 * roughly 90% of this box.
 */
const VIEW_BOX = '-80 -44 845 845';
const BASE_CLASS = 'uplifters-site-builder-blocks-brand-icon';

/*
 * Inner markup of icon.svg. "__ID__" is replaced with a per-instance prefix.
 * The static end frame (arrow fully cut, shine parked off the mark) is baked
 * into attributes, so the icon is complete even with no styles at all.
 */
const ARTWORK = '<defs><linearGradient id="__ID__g" gradientUnits="userSpaceOnUse" x1="21.7" y1="10.6" x2="542.7" y2="685.6"><stop offset="0" stop-color="#39E4FF"/><stop offset=".5" stop-color="#1A93EE"/><stop offset="1" stop-color="#0048CD"/></linearGradient><radialGradient id="__ID__h" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(140 120) rotate(35) scale(300 230)"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".55" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><radialGradient id="__ID__b" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(342 770) scale(420 330)"><stop offset="0" stop-color="#001a6e" stop-opacity=".38"/><stop offset=".6" stop-color="#001a6e" stop-opacity=".1"/><stop offset="1" stop-color="#001a6e" stop-opacity="0"/></radialGradient><linearGradient id="__ID__e" x1="0" x2="685" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#002080" stop-opacity=".22"/><stop offset=".12" stop-color="#002080" stop-opacity="0"/><stop offset=".88" stop-color="#001466" stop-opacity="0"/><stop offset="1" stop-color="#001466" stop-opacity=".28"/></linearGradient><linearGradient id="__ID__t" x1="0" x2="0" y1="0" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="__ID__w" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><path id="__ID__a" d="M302 763.8C 296.7 763.3 294.3 762.6 294.3 761.6 294.3 759.9 299.7 758.6 315.3 756.5 330.5 754.4 333.1 754 338.1 753.2 365.9 748.7 392.9 739.7 413.3 728.2 418.2 725.4 418.7 725.1 419.9 724.3 420.5 723.9 421 723.6 421.1 723.6 421.2 723.6 424.9 721.2 428.2 718.9 431.4 716.7 437.2 712.5 439.7 710.5 440.6 709.8 442.7 708.1 444.4 706.7 448.2 703.7 453.5 699.3 453.9 698.9 454 698.8 454.9 698 455.8 697.2 456.8 696.4 457.7 695.6 458 695.4 458.7 694.6 462.5 691.2 463 690.8 467.9 686.6 486.3 668 491.4 662.2 491.9 661.6 494.9 658.2 495.3 657.7 495.5 657.6 496.2 656.7 497.1 655.7 497.9 654.8 498.7 653.9 498.8 653.7 499 653.6 499.4 653 499.9 652.4 500.4 651.8 501 651.1 501.4 650.7 501.7 650.3 502.4 649.5 502.9 648.8 503.4 648.2 503.9 647.7 504 647.6 504 647.5 505.3 646 506.7 644.2 508.1 642.4 509.4 640.7 509.7 640.5 511.2 638.6 519.8 626.9 521.4 624.6 521.9 623.8 523.1 622.1 524.1 620.7 526 617.9 530.2 611.7 530.6 611.1 530.7 610.8 531.4 609.7 532.2 608.5 533 607.3 533.7 606.1 533.9 605.7 536.7 601.5 542.4 591.7 544.6 587.7 545.1 586.7 545.6 585.9 545.7 585.7 545.9 585.5 547.4 582.6 550.4 577 564.8 549.5 580.1 510.9 589.8 477.2 591.7 470.9 594.3 461.7 595.6 457.1 596.4 454.3 598 448.3 599.3 443.7 604.9 423.9 607.3 413.8 610.5 396.2 613.4 380.8 615.6 357.7 616.8 330.5 617.2 321.3 617.2 321.2 618 312.4 618.4 307.2 618.5 305.1 618.3 301.2 618 292.7 618 293.5 618.8 293.4 619.4 293.4 619.8 293.6 620.6 294.3 621.2 294.8 622 295.5 622.4 295.7 622.8 296 624 296.8 625 297.5 627.2 299 628.6 299.7 636.2 303.6 639.4 305.2 644.9 308 648.5 309.8 652 311.5 656.5 313.7 658.6 314.6 663.1 316.5 669.5 319.6 669.7 319.9 670.6 321.3 675.7 321.7 677.6 320.5 680.8 318.4 681.4 316.2 679.8 311.8 679.2 310.1 677.7 305.8 676.5 302.2 673.5 293.5 673.7 294.1 671.4 289 669.5 284.7 663.7 272.9 656.3 258.4 654.4 254.7 651.5 249 649.8 245.6 648 242.2 645.3 236.8 643.6 233.5 638.4 223.4 634.4 215.6 630.5 207.7 628.4 203.6 625.4 197.8 623.8 194.7 619.1 185.5 614.9 177.3 611.1 169.7 609 165.7 606.2 160.2 604.8 157.5 603.4 154.7 600.4 148.9 598.2 144.5 592.6 133.5 587.6 123.7 585.8 120.4 582.4 114.2 579.2 109.1 574.3 102.3 571.8 98.8 570.6 96.9 570.2 96.2 569.8 95.3 568.1 93.4 566.5 92.2 565.1 91.1 562.8 91 561.6 92 561.1 92.5 560.5 92.9 560.2 93 559.9 93.1 559.1 93.9 558.5 94.9 557.8 95.9 556.8 97.3 556.3 98 555.8 98.7 555.2 99.5 555 99.9 554.8 100.2 553.7 101.6 552.7 103 551.7 104.3 550.5 105.8 550.2 106.3 549.5 107.2 545.2 113.6 544.3 115 543.4 116.3 541.9 118.9 541 120.6 540.7 121.2 540 122.3 539.6 123.1 539.1 123.9 538.4 125.1 538 125.8 537.6 126.6 536.9 127.9 536.5 128.7 536.1 129.5 535.4 130.7 535 131.4 532.6 135.7 531.3 138.3 530.5 139.6 528.9 142.5 522.4 154.5 521.5 156.2 520.9 157.3 520.1 158.8 519.7 159.5 519.3 160.3 518.6 161.5 518.2 162.2 517.8 163 517.1 164.2 516.7 165 516.2 165.8 515.6 167 515.2 167.7 514.8 168.4 514.2 169.6 513.7 170.4 513.3 171.2 512.6 172.5 512.2 173.3 511.7 174.1 511 175.3 510.6 176.1 510.2 176.9 509.6 177.9 509.3 178.5 509 179 508.2 180.5 507.6 181.7 506.5 183.8 501.3 193.3 499.9 195.9 499.5 196.5 498.9 197.7 498.4 198.5 498 199.3 497.3 200.5 496.9 201.2 496.6 201.9 495.8 203.3 495.3 204.4 494.7 205.4 491.9 210.6 489 215.8 486.1 221.1 483.2 226.5 482.6 227.7 481.9 229 481.1 230.4 480.8 231 480.3 232 479.3 233.8 478 236.2 477 238 475.9 239.9 474.5 242.5 473.8 243.7 472.7 245.7 472.1 247 471.4 248.2 470.6 249.8 470.2 250.5 469.5 251.8 468.5 253.6 467.2 256 466.7 256.8 466.1 258 465.8 258.5 465.5 259.1 464.6 260.7 463.9 262 463.2 263.4 462.4 264.8 462.2 265.2 462 265.6 461.4 266.6 461 267.4 460.6 268.1 459.9 269.3 459.5 270.1 453.3 281.4 449 290.6 446 298.7 443.7 304.9 443.2 306.2 442.8 306.7 442.2 307.8 440.9 311.7 441.1 312.2 441.2 312.5 441.3 313 441.2 313.4 441.2 313.8 441.4 314.4 441.6 314.8 441.8 315.1 441.9 315.5 441.9 315.7 441.4 317 445.7 319.1 447.9 318.6 449.4 318.3 452.8 317 453.8 316.4 454.2 316.1 456.4 315.2 458.6 314.2 466 311.1 466.8 310.8 470.3 309.2 472.2 308.3 474.9 307.1 476.2 306.5 477.4 305.9 480.2 304.5 482.3 303.6 488.7 300.6 495.7 297.1 495.8 296.9 495.9 296.7 496.3 296.4 496.8 296.3 497.2 296.1 497.9 295.7 498.2 295.4 498.5 295.1 499.1 294.6 499.5 294.2 499.9 293.9 500.4 293.6 500.6 293.6 500.7 293.6 501.1 293.3 501.5 293 501.9 292.5 502.3 292.3 502.8 292.4 503.7 292.5 503.8 293.2 503.3 298.7 503.1 300.5 502.8 306 502.7 311 502.4 321.3 502.1 324.8 500.2 334 498.4 342.9 496.7 348.5 489.2 371.1 481.9 393.1 479.8 398.6 473.4 412.2 470.3 419 468.3 423.3 467.3 425.7 466.7 427 465.9 428.7 465.5 429.6 465.1 430.5 463.4 434.3 461.7 438.1 456.5 449.8 450 462.1 444.9 470 444.7 470.3 444.2 471.1 443.8 471.8 442.4 474.2 437 482 434.5 485.5 431 490.3 414.9 510.5 410.9 515.1 407.9 518.6 403.8 523.3 402.9 524.3 402.3 524.9 401.2 526.2 400.3 527.1 394.4 533.6 383.1 544.3 375.9 550.3 371.8 553.8 371.8 553.8 370.4 554.8 369.8 555.3 369.3 555.8 369.2 555.9 369.1 555.9 367.9 556.9 366.5 558 365 559.1 363.6 560.2 363.3 560.4 363.1 560.7 362.4 561.1 361.9 561.4 361.5 561.7 360.1 562.7 358.8 563.6 356.5 565.3 355.7 565.8 351.9 568.4 347.8 571.1 341.5 575.1 338.7 576.7 338.1 577 336.7 577.8 335.7 578.4 332.2 580.4 329.3 581.9 324.2 584.4 321.4 585.8 318.8 587 318.5 587.2 317.7 587.6 310.1 590.8 306.5 592.3 305 592.9 303.3 593.6 302.7 593.9 300.8 594.6 293 597.5 289.8 598.6 284.3 600.5 283.3 600.8 279.3 602.1 243.9 613.4 225.2 615.9 190.6 614.1 143.6 611.6 125.4 608.4 102.7 598.6 100.9 597.8 90.1 592.4 87.8 591.2 86.9 590.6 85.3 589.8 84.3 589.2 83.4 588.7 82 587.9 81.2 587.5 80.4 587.1 79.4 586.5 78.9 586.2 78.4 585.9 77.9 585.6 77.8 585.6 77.2 585.6 63.5 576.9 57.7 572.8 46.1 564.7 33.2 552 28 543.7L25.69 545.42 27.92 550.94 30.35 556.47 32.59 561.38 39.69 575.6 43.25 582.26 44.06 583.69 55.65 602.84 59.21 608.27 63.48 614.52 66.54 618.82 67.96 620.67 70.51 624.05 73.26 627.64 76.01 631.12 79.78 635.73 81.71 637.99 83.65 640.35 89.87 647.42 115.17 672.56 116.7 673.89 121.5 678.1 122.73 679.12 124.36 680.46 127.12 682.82 130.8 685.8 134.27 688.57 148.57 699.04 152.36 701.71 173.62 714.96 174.85 715.68 176.9 716.81 178.94 717.94 211.89 733.97 212.2 734.1 228.67 740.81 244.06 746.8 258.5 752.07 272.09 756.63 284.96 760.49 297.22 763.64 306.68 765.65 302 763.8Z"/><path id="__ID__u" d="M342.65 504.79C361.78 505.49 380.83 500.29 394.1 490 394.8 489.5 395.9 488.6 396.6 488.1 401 484.8 407.8 477.2 411.9 471.1 422.4 455.4 428.1 437.9 430 415 430.2 412.7 430.3 359.9 430.4 242.2 430.6 68.8 430.6 67.2 431.6 57.6 433.6 37 440.4 23.2 453.1 13.5 464.5 5 476.8 1.3 498.1 0.4 505.4 0 611 0 618.1 0.4 641 1.4 654.2 5.7 665.4 15.6 677.9 26.6 683 39.3 684.5 63.2 685.3 75.8 685 418.8 684.2 430.8 682.7 454.5 676.6 480.4 665.5 511.4 661.6 522.1 657.2 533.5 652.8 543.8 652 545.7 651 548.1 650.6 549.2 650.1 550.3 649.1 552.7 648.2 554.6 647.4 556.5 646.4 558.6 646 559.4 645.1 561.3 640.4 570.8 639 573.3 636.9 577.2 636.3 578.5 635.5 579.8 635 580.5 634.7 581.2 634.7 581.2 634.7 581.6 626 595.7 623.3 599.9 621.5 602.6 620 604.9 619.8 605.2 619.5 605.8 617.9 608 615.6 611.3 614.5 612.8 613.1 614.7 612.6 615.5 612.1 616.2 611.4 617 611.2 617.3 611 617.5 609.8 619 608.7 620.6 607.5 622.2 606.3 623.8 606 624.1 605.7 624.5 604.5 626 603.3 627.5 602.1 629 600.4 631 599.6 632 598.8 632.9 598 634 597.7 634.2 597.5 634.5 596.6 635.5 595.8 636.5 594 638.6 593.3 639.4 589.7 643.4 583.5 650.2 570.9 662.7 564.9 667.9 564.6 668.2 563.9 668.7 563.4 669.2 562.6 669.9 560.1 672.1 558.7 673.3 558.4 673.6 557.8 674 557.5 674.3 557.2 674.6 556.5 675.2 555.9 675.6 555.3 676.1 554.1 677.1 553.2 677.9 552.3 678.6 550.7 679.9 549.6 680.8 548.5 681.7 547 682.9 546.2 683.5 544.1 685.1 534.6 692.1 532.2 693.7 531 694.5 529.4 695.7 528.5 696.3 524.3 699.2 509.4 708.4 507.7 709.2 507.5 709.3 506.9 709.6 506.5 709.9 506 710.2 505.1 710.7 504.5 711 503.8 711.4 502.9 711.9 502.5 712.1 496.3 715.8 478.8 724.3 470.3 727.7 470.2 727.74 470.1 727.78 470 727.82 381 763.42 304.3 763.42 215.3 727.82 215.2 727.78 215.1 727.74 215 727.7 206.5 724.3 189 715.8 182.8 712.1 182.4 711.9 181.5 711.4 180.8 711 180.2 710.7 179.3 710.2 178.8 709.9 178.4 709.6 177.8 709.3 177.6 709.2 175.9 708.4 161 699.2 156.8 696.3 155.9 695.7 154.3 694.5 153.1 693.7 150.7 692.1 141.2 685.1 139.1 683.5 138.3 682.9 136.8 681.7 135.7 680.8 134.6 679.9 133 678.6 132.1 677.9 131.2 677.1 130 676.1 129.4 675.6 128.8 675.2 128.1 674.6 127.8 674.3 127.5 674 126.9 673.6 126.6 673.3 125.2 672.1 122.7 669.9 121.9 669.2 121.4 668.7 120.7 668.2 120.4 667.9 114.4 662.7 101.8 650.2 95.6 643.4 92 639.4 91.3 638.6 89.5 636.5 88.7 635.5 87.8 634.5 87.6 634.2 87.3 634 86.5 632.9 85.7 632 84.9 631 83.2 629 82 627.5 80.8 626 79.6 624.5 79.3 624.1 79 623.8 77.8 622.2 76.6 620.6 75.5 619 74.3 617.5 74.1 617.3 73.9 617 73.2 616.2 72.7 615.5 72.2 614.7 70.8 612.8 69.7 611.3 67.4 608 65.8 605.8 65.5 605.2 65.3 604.9 63.8 602.6 62 599.9 59.3 595.7 50.6 581.6 50.6 581.2 50.6 581.2 50.3 580.5 49.8 579.8 49 578.5 48.4 577.2 46.3 573.3 44.9 570.8 40.2 561.3 39.3 559.4 38.9 558.6 37.9 556.5 37.1 554.6 36.2 552.7 35.2 550.3 34.7 549.2 34.3 548.1 33.3 545.7 32.5 543.8 28.1 533.5 23.7 522.1 19.8 511.4 8.7 480.4 2.6 454.5 1.1 430.8 0.3 418.8 0 75.8 0.8 63.2 2.3 39.3 7.4 26.6 19.9 15.6 31.1 5.7 44.3 1.4 67.2 0.4 74.3 0 179.9 0 187.2 0.4 208.5 1.3 220.8 5 232.2 13.5 244.9 23.2 251.7 37 253.7 57.6 254.7 67.2 254.7 68.8 254.9 242.2 255 359.9 255.1 412.7 255.3 415 257.2 437.9 262.9 455.4 273.4 471.1 277.5 477.2 284.3 484.8 288.7 488.1 289.4 488.6 290.5 489.5 291.2 490 304.47 500.29 323.52 505.49 342.65 504.79Z"/><clipPath id="__ID__c"><use href="#__ID__a"/></clipPath><clipPath id="__ID__q"><use href="#__ID__u"/></clipPath><mask id="__ID__k" maskUnits="userSpaceOnUse" x="-10" y="-10" width="706" height="786"><rect x="-10" y="-10" width="706" height="786" fill="#fff"/><g clip-path="url(#__ID__c)"><path class="uplifters-site-builder-blocks-brand-icon__draw" stroke-dasharray="1020 2040" stroke-dashoffset="0" fill="none" stroke="#000" stroke-width="400" d="M0 728C90 722 200 706 297 679C360 659 405 632 434 606C455 587 468 570 478 551C500 512 520 480 532 445C546 405 556 372 558 340C560 260 564 170 566 80"/></g></mask><mask id="__ID__m" maskUnits="userSpaceOnUse" x="-10" y="-10" width="720" height="800"><g clip-path="url(#__ID__c)"><path class="uplifters-site-builder-blocks-brand-icon__draw" stroke-dasharray="1020 2040" stroke-dashoffset="0" fill="none" stroke="#fff" stroke-width="400" d="M0 728C90 722 200 706 297 679C360 659 405 632 434 606C455 587 468 570 478 551C500 512 520 480 532 445C546 405 556 372 558 340C560 260 564 170 566 80"/></g></mask></defs><g mask="url(#__ID__k)"><use href="#__ID__u" fill="url(#__ID__g)"/><g clip-path="url(#__ID__q)"><rect x="-10" y="-10" width="706" height="786" fill="url(#__ID__h)"/><rect x="-10" y="-10" width="706" height="786" fill="url(#__ID__b)"/><rect x="-10" y="-10" width="706" height="786" fill="url(#__ID__e)"/><rect x="-10" y="0" width="706" height="90" fill="url(#__ID__t)"/><g fill="#001a6e"><g transform="translate(10 14)" opacity=".15" mask="url(#__ID__m)"><use href="#__ID__a"/></g><g transform="translate(5 7)" opacity=".2" mask="url(#__ID__m)"><use href="#__ID__a"/></g></g><g transform="skewX(-18)"><rect class="uplifters-site-builder-blocks-brand-icon__shine" transform="translate(-900 0)" x="-120" y="-10" width="240" height="900" fill="url(#__ID__w)"/></g></g></g>';

/*
 * icon.svg's own animation with namespaced class and keyframe names, scoped
 * to --animated instances. Inline SVG styles are document-wide, so the
 * original ".d" / ".s" / "r" / "w" names would leak into the admin page.
 */
const ANIMATION_CSS = '@media (prefers-reduced-motion:no-preference){.uplifters-site-builder-blocks-brand-icon--animated .uplifters-site-builder-blocks-brand-icon__draw{animation:uplifters-site-builder-blocks-brand-icon-draw 4.8s infinite}.uplifters-site-builder-blocks-brand-icon--animated .uplifters-site-builder-blocks-brand-icon__shine{animation:uplifters-site-builder-blocks-brand-icon-shine 4.8s infinite}}@keyframes uplifters-site-builder-blocks-brand-icon-draw{0%,6%{stroke-dashoffset:1020;animation-timing-function:cubic-bezier(.65,0,.35,1)}56%,76%{stroke-dashoffset:0;animation-timing-function:cubic-bezier(.65,0,.35,1)}96%,100%{stroke-dashoffset:-1020}}@keyframes uplifters-site-builder-blocks-brand-icon-shine{0%,55%{transform:translateX(-900px);animation-timing-function:cubic-bezier(.65,0,.35,1)}75%,100%{transform:translateX(900px)}}';

let instanceCount = 0;

/**
 * Create the brand icon as a native SVG element.
 *
 * @param {Object}  [options]          Icon options.
 * @param {number}  [options.size]     Rendered width and height in px.
 * @param {boolean} [options.animated] Play the arrow draw-in and shine loop.
 *                                     Honours prefers-reduced-motion.
 * @return {SVGElement|null} Icon element, or null outside a browser.
 */
export function createIcon({ size = 28, animated = true } = {}) {
	if (typeof document === 'undefined') {
		return null;
	}

	instanceCount += 1;

	const idPrefix = `uplifters-site-builder-blocks-dashboard-brand-icon-${instanceCount}-`;
	const classNames = ['uplifters-site-builder-blocks-dashboard-brand-icon', BASE_CLASS];

	if (animated) {
		classNames.push(`${BASE_CLASS}--animated`);
	}

	const svg = document.createElementNS(SVG_NS, 'svg');
	const attributes = {
		class: classNames.join(' '),
		width: String(size),
		height: String(size),
		viewBox: VIEW_BOX,
		'aria-hidden': 'true',
		focusable: 'false',
	};

	Object.keys(attributes).forEach((name) => {
		svg.setAttribute(name, attributes[name]);
	});

	svg.innerHTML = (animated ? `<style>${ANIMATION_CSS}</style>` : '') + ARTWORK.split('__ID__').join(idPrefix);

	return svg;
}

if (typeof window !== 'undefined') {
	window.UpliftersSiteBuilderBlocksDashboardBrandIcon = {
		createIcon,
	};
}
