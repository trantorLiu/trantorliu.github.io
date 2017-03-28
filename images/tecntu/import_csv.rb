# 0 - 團隊名稱 - name
# 1 - 公司登記名稱 - company
# 2 - 產品或服務名稱 - products_or_services
# 3 - 網路服務 - vertical
# 4 - 物聯網
# 5 - 教育應用
# 6 - 娛樂與旅遊
# 7 - 食品與農業
# 8 - 社會文化
# 9 - 生醫
# 10 - Other
# 11 - 員工人數 - number_of_employees
# 12 - 成立年份 - founded_year
# 13 - 團隊官網網址 - website_url
# 14 - 團隊官方 Email - email
# 15 - 地址 - address
# 16 - Facebook URL - facebook_url
# 17 - YouTube 影片連結 - youtube_video_url
# 18 - 聯絡人姓名 - contact_name
# 19 - 聯絡人 email
# 20 - 聯絡人電話 - phone
# 21 - 團隊簡短描述 - description
# 22 - 團隊詳述 - company_overview
# 23 - 工作環境 - work_environment
# 24 - 員工福利 - employee_benefits
# 25 - 媒體報導 - media_coverage
# 26 - 【 Logo 上傳 - 必填 】請依序完成：一、logo 檔名請標注「logo - (團隊名稱)」。請使用 PNG 或 JPG 格式。二、上傳至 https://dropitto.me/2017tecmatchlab，密碼請輸入boomboomboom三、回答您的檔名於下
# 27 - 【 封面照上傳 - 選填，團隊自由繳交】請依序完成：一、檔名請標注「封面照 - (團隊名稱)」。請使用 PNG 或 JPG 格式。建議大小 1500*500 px 。二、上傳至https://dropitto.me/2017tecmatchlab，密碼請輸入boomboomboom三、回答您的檔名於下
# 28 - PART V 職缺資訊預計招募＿種職缺。請填數值。
##########################################################
# 29 - 職缺名稱
# 30 - 職缺描述
# 31 - 應徵條件
# 32 - 徵求人數
# 33 - 工作地點
# 34 - Other
# 35 - 薪資計算方式
# 36 - Other
# 37 - 薪資範圍 志工/無給職者請填 0。
# 38 - 前端工程
# 39 - 後端工程
# 40 - 資料分析
# 41 - 網頁相關
# 42 - IOS 開發相關
# 43 - Android 開發相關
# 44 - AI / 機器學習
# 45 - 設計相關
# 46 - 行銷相關
# 47 - 媒體相關
# 48 - 銷售 / 客服相關
# 49 - Other
# 50 - 在學學生 / 實習生
# 51 - 應屆畢業生
# 52 - 1-2年工作經驗
# 53 - 2-5年工作經驗
# 54 - 5-10年工作經驗
# 55 - 不拘年資
# 56 - 關於本職缺的幾個 hashtag

require 'csv'
require 'uri'
require 'metainspector'

def get_logo filename
  ext = if filename && filename.split('.').length > 1
    ''
  else
    '.png'
  end

  Pathname.new("/Users/trantorliu/tecntu/images/logos/#{filename}#{ext}").open
end

def get_cover_image filename
  ext = if filename && filename.split('.').length > 1
    ''
  else
    '.png'
  end

  p = Pathname.new("/Users/trantorliu/tecntu/images/cover_images/#{filename}#{ext}")

  if p.exist?
    p.open
  else
    nil
  end
end

csv = CSV.read('/Users/trantorliu/tecntu/tecntu_tratnor_version.csv')
collection = PageCollection.find_by_subdomain!('tecntu')

pages_exist = {
  'VoiceTube' => 'voicetube',
  '91APP_九易宇軒股份有限公司' => '91app',
  'JumpLife' => 'gamadian',
  'SkyREC' => 'skyrec.cc',
  'Fandora' => 'fandorashop',
  'iCHEF' => 'ichefpos',
  '早餐吃麥片' => 'morningshop',
  '猿創力程式設計學校' => 'codingapeschool',
  '無毒農 - 友善環境的安心水果' => 'GreenBox',
  '鮮乳坊' => 'ilovemilk',
  'FRNCi' => 'frnci',
  '龍骨王有限公司' => 'longgood',
  'CHOCOLABS' => 'chocolabs',
  'PicCollage拼貼趣' => 'pic-collage',
  'TRAIWAN' => 'traiwan',
}

pages_duplicated_with_sudo = [
  'shopline', '2erguy', 'fashionguide', 'wemoscooter'
]

rows = csv[1..-1]

old_logger = ActiveRecord::Base.logger
ActiveRecord::Base.logger = nil

Page.transaction do
  Job.transaction do
    rows.each_with_index do |r, i|
      begin

        puts "Start row #{i} - #{r[0]}"
        r.each { |v| v.try(:strip!) }

        path = if r[0] == '東遊 DONGYO'
          'dongyodongyo'
        elsif r[13]
          if !r[13].include? 'http'
            r[13] = 'https://' + r[13]
          end
          URI(r[13]).host.gsub('www.', '').gsub('.com', '').gsub('.tw', '')
        else
          Page.unique_top_level_path
        end

        vertical_list = r[3..9]
        if r[10].present?
          vertical_list.push('其他產業')
        end
        vertical_list = vertical_list.select { |v| v.present? }

        attrs = {
          name: r[0],
          path: path,
          company: r[1] || r[0],
          products_or_services: r[2],
          number_of_employees: r[11],
          founded_year: r[12],
          website_url: r[13],
          email: r[14],
          address: r[15],
          facebook_url: r[16],
          youtube_video_url: r[17],
          contact_name: r[18],
          phone: r[20],
          description: r[21].truncate(140),
          company_overview: r[22],
          work_environment: r[23],
          employee_benefits: r[24],
          media_coverage: r[25],
        }

        if pages_exist.keys.include? r[0]
          p = Page.find_by_path! pages_exist[r[0]]

          attrs.each do |k, v|
            if p.send(k).blank?
              p.send("#{k}=", v)
            end
          end
        else
          p = Page.new attrs

          p.user = User.find_by_email('trantor.liu@gmail.com')
          p.admins << User.find_by_email('trantor.liu@gmail.com')
        end

        p.logo = get_logo r[26]

        if get_cover_image r[27]
          p.cover_image = get_cover_image r[27]
        else
          p.remote_cover_image_url = 'http://res.cloudinary.com/dsnlp69n2/image/upload/c_fill,h_500,w_1500/v1482026606/page__cover_image_1482026605.png'
        end

        if u = User.find_by_email(p.email) && !p.admins.include?(u)
          p.admins << u
        end

        p.vertical_list.add(*vertical_list)

        if !p.collections.include? collection
          p.collections << collection
        end

        puts "Saving page: #{p.name} | #{p.path}"

        # unless p.valid?
        #   ap p.attributes.slice('name', 'path')
        #   ap p.errors.full_messages
        # end

        # Dev: original page count: 309, last page name: CakeResume
        if !p.save
          ap p.errors.full_messages
          binding.pry
          p.save!
        end

        10.times do |i|
          start = i * 28 + 29

          if r[start].present?
            j_path = Job.unique_path r[start]

            j_description = helper.simple_format("%30s" % r[start + 1]).gsub("\n", '')
            j_description + "\n\n薪資：#{r[start + 6]}"

            j_location = if r[start + 4] == '同上述公司地址'
              nil
            else
              r[start + 4]
            end

            job_function_list = r[(start + 9)..(start + 19)]
            if r[start + 20].present?
              job_function_list.push('其他職業別')
            end
            job_function_list = job_function_list.select { |v| v.present? }

            work_experience_list = r[(start + 21)..(start + 25)]
            if r[start + 26].present?
              work_experience_list.push('年資不拘')
            end
            work_experience_list = work_experience_list.select { |v| v.present? }

            other_tags = if r[start + 27].present?
              r[start + 27].gsub(/\s|\n/, '').gsub('# ', '#').split('#').map { |t| t.strip }
            else
              []
            end

            j = p.jobs.new({
              path: j_path,
              title: r[start],
              description: j_description,
              requirements: "%10s" % r[start + 2],
              number_of_openings: (r[start + 3].present? ? r[start + 3] : 1),
              location: j_location,
              salary_min: 0,
              salary_max: 0,
              job_function_list: job_function_list,
              work_experience_list: work_experience_list,
              tag_list: other_tags,
            })

            puts "Saving job: #{j.title} | #{j.path}"

            # unless j.valid?
            #   ap j.attributes.slice('title')
            #   ap j.errors.full_messages
            # end

            # Dev: original page count: 1507, last job title: 平面設計實習生
            if !j.save
              ap j.errors.full_messages
              binding.pry
              j.save!
            end


          end
        end

      rescue => e
        puts e.backtrace
        ActiveRecord::Base.logger = old_logger

        binding.pry
        raise
      end
    end
  end
end