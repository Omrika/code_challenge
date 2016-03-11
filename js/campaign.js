var CampaignViewer = {

    BASE_URL: 'http://challenge.mediamath.com/api',

    config: {},

    init: function( opt ) {
        CampaignViewer.config = opt;
        CampaignViewer.getAgencies({
            onChange: function( e ) {
                CampaignViewer.getAdvertisers( e.target.value ) ;
            }
        });

        $campaign_head = $('.campaign-view ')
        $campaign_head.hide()

        $( '.get-campaigns' ).on('click', function( e ) {
            $campaign_head.show()
            var advertiserId = $( '.advertiser' ).val();
            CampaignViewer.getCampaigns( advertiserId );
        });

        $('.save').on('click', function() {
            CampaignViewer.submitData()
        });

    },

    getAgencies: function( opt ) {
        var endpoint = '/agencies';
        var $agencyEl = $( '.agency' );

        CampaignViewer.fetchData({
            endpoint: endpoint,
            success: function( response ) {
                response.agencies.map(function( agency, index ) {
                    var $option = $( '<option />', {
                        value: agency._id,
                        text: agency.name
                    });
                    $agencyEl.append( $option );
                });
            }
        });

        if ( typeof opt.onChange === 'function' ) $agencyEl.on( 'change', opt.onChange );
    },

    getAdvertisers: function( agencyId ) {
        var endpoint = '/advertisers/';
        var $advertiserEl = $( '.advertiser' );
            $advertiserEl.html( '' );

        CampaignViewer.fetchData({
            endpoint: endpoint,
            success: function( response ) {
                response.advertisers.map(function( advertiser, index ) {
                    if ( advertiser.agency_id === agencyId ) {
                        var $option = $( '<option />', {
                            value: advertiser._id,
                            text: advertiser.name
                        });

                        $advertiserEl.append( $option );
                    }
                });
            }
        });
    },

    getCampaigns: function( advertiser_id ) {
        var endpoint = '/campaigns';

        var $campaignView = $( '.campaign-view' );

        CampaignViewer.fetchData({
            endpoint: endpoint,
            params: {
                advertiser_id: advertiser_id
            },
            success: function( response ) {

                var $tbody = $campaignView.find( 'tbody' );
                    $tbody.html( '' );

                var order = [ 'name', 'status', 'budget', 'start_date', 'end_date' ];

                response.campaigns.map(function( campaign, index ) {
                    
                    var $tr = $( '<tr/>', {
                        value: campaign._id
                    });

                    for ( var i = 0; i < order.length; i++ ) {
                        var $td = $( '<td />');

                        var $input = $('<input />', {
                            value: campaign[ order[i] ]
                        });
                        
                        $tr.append( $td );

                        if ( campaign.start_date == $input.val() || campaign.end_date == $input.val() ) {
                            $input.attr( 'class', 'datepicker');
                            $input.val($input.val().split('T')[0]);
                        }

                        if ( campaign.budget.toString() == $input.val() ) {
                            $input.val('$' + $input.val());
                        }

                        
                        $td.append( $input );

                        if ( campaign.name == $input.val() ) {
                            $input.parent().prepend('<input type="checkbox"/>')
                        }
                    }
                    $tbody.append( $tr );
                    $(function() {
                        $( ".datepicker" ).datepicker();
                    });
                });
            }
        });
    },

    submitData: function( advertiserId ) {
        $('#myTable tr').filter(':has(:checkbox:checked)').each(function() {
            var $inputs = $(this).find('td input')
            $tr = $(this)
            campaign_id = $tr.attr('value');
            $.ajax({    
                type: "POST",
                url: CampaignViewer.BASE_URL + '/campaigns/' + campaign_id, 
                data: {
                    api_token: CampaignViewer.config.api_token,
                    name: $inputs.eq(1).val(),
                    status: $inputs.eq(2).val(),
                    budget: parseInt($inputs.eq(3).val().split('$')[1]),
                    start_date: $inputs.eq(4).val(),
                    end_date: $inputs.eq(5).val()
                },
                success: function( result ) {
                    if ( result.status = 'ok' ) {
                        alert("All selected campaignes have been successfully updated!");
                    } else {
                        alert("There was an error saving your campaignes");
                    }
                }
            });

        });

    },

    fetchData: function( opt ) {
        opt.params = opt.params || {};
        opt.params.api_token = CampaignViewer.config.api_token;

        $.getJSON( CampaignViewer.BASE_URL + opt.endpoint, opt.params ).success(function( response ) {
            if ( typeof opt.success === 'function' ) opt.success( response );
        });
    }
};

$( document ).on('ready', function() {

    CampaignViewer.init({ api_token: '52dd28ab08f0153d740beaf0f2744a7b4cf5a752' });
});